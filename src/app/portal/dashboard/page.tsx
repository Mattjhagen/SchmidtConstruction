import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getSupabaseServer } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export default async function ClientDashboardPage() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/portal/login?next=/portal/dashboard');
  }

  // Find the client record matching this user's email
  const { data: client } = await supabase
    .from('clients')
    .select('id, name, email, phone, address')
    .eq('email', user.email!)
    .maybeSingle();

  // Is this signed-in user actually an employee? (Helps show a better message
  // when a staff member lands on the portal without a linked employee record,
  // and auto-routes linked staff to the admin app.)
  const { data: employee } = await supabase
    .from('employees')
    .select('id, user_id, role')
    .eq('user_id', user.id)
    .maybeSingle();

  // A linked employee should be in the admin app, not the client portal.
  if (employee) {
    redirect('/dashboard');
  }

  let proposals: {
    id: string;
    proposal_number: string;
    status: string;
    share_token: string;
    expiration_date: string | null;
    project_name: string;
    total: number | null;
  }[] = [];

  if (client) {
    // Load all projects for this client, then proposals for each
    const { data: projects } = await supabase
      .from('projects')
      .select('id, name')
      .eq('client_id', client.id);

    if (projects && projects.length > 0) {
      const projectIds = projects.map(p => p.id);
      const { data: rawProposals } = await supabase
        .from('proposals')
        .select('id, proposal_number, status, share_token, expiration_date, project_id, current_version_id')
        .in('project_id', projectIds)
        .order('created_at', { ascending: false });

      if (rawProposals) {
        // Attach project name and version total
        const versionIds = rawProposals
          .map(p => p.current_version_id)
          .filter(Boolean) as string[];

        const { data: versions } = versionIds.length
          ? await supabase.from('proposal_versions').select('id, total').in('id', versionIds)
          : { data: [] };

        const versionMap = Object.fromEntries((versions ?? []).map(v => [v.id, v.total]));
        const projectMap = Object.fromEntries(projects.map(p => [p.id, p.name]));

        proposals = rawProposals.map(p => ({
          id: p.id,
          proposal_number: p.proposal_number,
          status: p.status,
          share_token: p.share_token,
          expiration_date: p.expiration_date,
          project_name: projectMap[p.project_id] ?? 'Unknown Project',
          total: p.current_version_id ? (versionMap[p.current_version_id] ?? null) : null,
        }));
      }
    }
  }

  const statusColor: Record<string, string> = {
    Draft: 'bg-gray-100 text-gray-600',
    Sent: 'bg-blue-100 text-blue-700',
    Viewed: 'bg-yellow-100 text-yellow-700',
    Accepted: 'bg-green-100 text-green-700',
    Revised: 'bg-orange-100 text-orange-700',
    Declined: 'bg-red-100 text-red-700',
  };

  const handleSignOut = async () => {
    'use server';
    const sb = await getSupabaseServer();
    await sb.auth.signOut();
    redirect('/portal/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between max-w-4xl mx-auto">
        <Image src="/logo.png" alt="Schmidt Construction" width={140} height={48} className="h-10 w-auto" />
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-500 hidden sm:block">{user.email}</span>
          <form action={handleSignOut}>
            <button type="submit" className="text-gray-500 hover:text-gray-800 font-medium transition-colors">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900">
            {client ? `Welcome, ${client.name.split(' ')[0]}` : 'Your Portal'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {proposals.length > 0
              ? `You have ${proposals.length} proposal${proposals.length !== 1 ? 's' : ''} on file.`
              : 'No proposals found yet.'}
          </p>
          {!client && (
            <div className="mt-3 bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded-xl px-4 py-3">
              We couldn&apos;t find any proposals linked to <strong>{user.email}</strong> yet. If you were sent a proposal, make sure you signed in with the same email it was sent to. If you&apos;re a Schmidt Construction employee, ask an admin for your invite link to activate staff access. Otherwise, please contact us and we&apos;ll get you connected.
            </div>
          )}
        </div>

        {proposals.length > 0 && (
          <div className="space-y-4">
            {proposals.map(p => (
              <Link
                key={p.id}
                href={`/portal/${p.share_token}`}
                className="block bg-white rounded-2xl border border-gray-200 p-5 hover:border-yellow-400 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900">{p.proposal_number}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor[p.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {p.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{p.project_name}</p>
                    {p.expiration_date && (
                      <p className="text-xs text-gray-400 mt-1">
                        Expires {new Date(p.expiration_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {p.total != null && (
                    <div className="text-right">
                      <span className="text-lg font-extrabold text-gray-900">
                        ${Number(p.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
