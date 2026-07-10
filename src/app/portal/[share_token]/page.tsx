// Client Portal Route (Next.js Server Component)
// Location: src/app/portal/[share_token]/page.tsx

import { db } from '../../../lib/db';
import ClientPortalView from '../../../components/ClientPortalView';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ share_token: string }>;
}

export default async function ClientPortalPage({ params }: PageProps) {
  const { share_token } = await params;

  // 1. Fetch proposal by public share token on the server
  const proposal = await db.getProposalByShareToken(share_token);
  if (!proposal) {
    return notFound();
  }

  // 2. Fetch project and client
  const project = await db.getProject(proposal.project_id);
  if (!project) {
    return notFound();
  }

  const client = await db.getClient(project.client_id);
  if (!client) {
    return notFound();
  }

  // 3. Fetch current active version
  if (!proposal.current_version_id) {
    return notFound();
  }
  const rawVersion = await db.getProposalVersion(proposal.current_version_id);
  if (!rawVersion) {
    return notFound();
  }

  // 4. SANITIZE version payload on the server
  const sanitizedVersion = db.sanitizeProposalVersionForClient(rawVersion);

  // 5. Fetch line items
  const lineItems = await db.getLineItems(sanitizedVersion.id);

  // 6. Record Viewed audit logs and update status if Sent
  try {
    if (proposal.status === 'Sent') {
      // Transition from Sent to Viewed automatically
      await db.updateProposalStatus(
        proposal.id, 
        'Viewed', 
        'system', 
        'Proposal opened and viewed via secure client portal.'
      );
    } else {
      // Just record a standard VIEW log without changing the overall proposal status
      await db.createAuditLog({
        proposal_id: proposal.id,
        user_id: null,
        action: 'VIEW',
        details: 'Proposal portal link opened and viewed.'
      });
    }
  } catch (err) {
    console.error('Error logging view event:', err);
  }

  return (
    <div className="py-6">
      <ClientPortalView
        initialProposal={proposal}
        project={project}
        client={client}
        version={sanitizedVersion}
        lineItems={lineItems}
      />
    </div>
  );
}
export const dynamic = 'force-dynamic';
