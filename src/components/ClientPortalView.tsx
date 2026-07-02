// Interactive Client Portal View (Client Component)
// Location: src/components/ClientPortalView.tsx

'use client';

import { useState } from 'react';
import { db } from '@/lib/db';
import { exportProposalPDF } from '@/lib/pdf';
import { Proposal, Project, Client, ProposalVersion, ProposalLineItem } from '@/lib/types';
import Image from 'next/image';
import {
  CheckCircle,
  Clock,
  Printer,
  Download,
  MessageSquare,
  Calendar,
  ShieldAlert,
  FileText,
  Award,
  Signature,
  MapPin
} from 'lucide-react';

interface ClientPortalViewProps {
  initialProposal: Proposal;
  project: Project;
  client: Client;
  version: ProposalVersion; // Already sanitized server-side (internal_notes is omitted)
  lineItems: ProposalLineItem[];
}

export default function ClientPortalView({
  initialProposal,
  project,
  client,
  version,
  lineItems
}: ClientPortalViewProps) {
  const [proposal, setProposal] = useState<Proposal>(initialProposal);
  const [clientNameInput, setClientNameInput] = useState('');
  const [commentText, setCommentText] = useState('');
  const [changeRequestText, setChangeRequestText] = useState('');
  const [isChangeRequest, setIsChangeRequest] = useState(false);
  const [submittedComment, setSubmittedComment] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  
  // Track checked optional items locally
  const [selectedOptionalIds, setSelectedOptionalIds] = useState<Record<string, boolean>>({});

  const reloadData = async () => {
    try {
      const prop = await db.getProposal(proposal.id);
      if (prop) setProposal(prop);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAcceptProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientNameInput.trim() || !proposal || !version) return;

    try {
      setLoading(true);
      const timestamp = new Date().toISOString();
      
      const selectedOptionals = lineItems
        .filter(item => item.optional && selectedOptionalIds[item.id])
        .map(item => item.description)
        .join(', ');

      const acceptanceNotes = `Proposal accepted with E-Signature by ${clientNameInput.trim()} at ${new Date(timestamp).toLocaleString()}. ${
        selectedOptionals ? `Included options: [${selectedOptionals}]` : 'No optional items selected.'
      }`;

      await db.updateProposalStatus(
        proposal.id,
        'Accepted',
        'client',
        acceptanceNotes
      );

      await reloadData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() && !changeRequestText.trim()) return;

    try {
      setLoading(true);
      const messageContent = commentText.trim() || 'Submitted feedback via portal.';
      
      await db.createNegotiationEvent({
        proposal_id: proposal.id,
        proposal_version_id: proposal.current_version_id,
        sender_type: 'client',
        message: messageContent,
        requested_changes: isChangeRequest ? changeRequestText.trim() : ''
      });

      if (isChangeRequest) {
        await db.updateProposalStatus(
          proposal.id,
          'Revised',
          'system',
          `Client requested revisions: "${changeRequestText.trim()}"`
        );
      }

      setCommentText('');
      setChangeRequestText('');
      setIsChangeRequest(false);
      setSubmittedComment(true);
      setTimeout(() => setSubmittedComment(false), 5000);
      
      await reloadData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleOptionalItem = (id: string) => {
    setSelectedOptionalIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getActiveTotal = () => {
    const baseTotal = Number(version.total);
    const optionalsSum = lineItems
      .filter(item => item.optional && selectedOptionalIds[item.id])
      .reduce((sum, item) => {
        const rawCost = item.quantity * item.unit_cost;
        const markupFactor = 1 + (item.markup_percent / 100);
        return sum + (rawCost * markupFactor);
      }, 0);
    return baseTotal + optionalsSum;
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') window.print();
  };

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      const filename = `Schmidt-Construction-${proposal.proposal_number}-V${version.version_number}.pdf`;
      await exportProposalPDF('proposal-print-sheet', filename);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('PDF export failed. Please try the Print button as a fallback.');
    } finally {
      setPdfLoading(false);
    }
  };

  const baseItems = lineItems.filter(item => !item.optional);
  const optionalItems = lineItems.filter(item => item.optional);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Top Banner Control Panel (Hidden on Print) */}
      <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl border border-slate-800 premium-shadow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div>
          <h2 className="text-base font-bold text-white leading-none">
            Proposal {proposal.proposal_number} (Version {version.version_number})
          </h2>
          <span className="text-xs text-slate-400 block mt-1">
            Status: <span className="text-blue-400 font-semibold uppercase">{proposal.status}</span>
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={handleDownloadPDF}
            disabled={pdfLoading}
            className="flex items-center justify-center space-x-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white px-4 py-2.5 rounded-xl transition-colors text-xs font-bold cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>{pdfLoading ? 'Generating PDF…' : 'Download PDF'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl border border-slate-700 transition-colors text-xs font-semibold cursor-pointer"
          >
            <Printer className="h-4 w-4 text-blue-400" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Main Proposal Printable Invoice Sheet */}
      <div id="proposal-print-sheet" className="bg-white p-6 sm:p-12 rounded-2xl border border-slate-200 premium-shadow space-y-8 print-page">
        {/* Printable Header: Contractor Branding */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-200 pb-8">
          <div>
            <Image
              src="/logo.png"
              alt="Schmidt Construction Inc."
              width={220}
              height={74}
              className="h-14 w-auto"
              priority
            />
            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-4 space-y-0.5">
              <p>50+ Years Contracting Excellence</p>
              <p>Omaha, NE | office@schmidtconstruction.com</p>
              <p>Phone: (402) 555-0199</p>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs">
            <span className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-800 font-bold uppercase tracking-wide rounded-full block w-max sm:ml-auto mb-3">
              Proposal Estimate
            </span>
            <div className="space-y-1 text-slate-600">
              <p>Proposal No: <span className="font-bold text-slate-900">{proposal.proposal_number}</span></p>
              <p>Version: <span className="font-bold text-slate-900">V{version.version_number}</span></p>
              <p>Date: <span className="font-bold text-slate-900">{new Date(version.created_at).toLocaleDateString()}</span></p>
            </div>
          </div>
        </div>

        {/* Client & Job Site Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-200/80 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Estimate Prepared For</span>
            <div className="font-semibold text-slate-900 space-y-1">
              <p className="text-sm">{client?.name}</p>
              <p>{client?.phone}</p>
              <p>{client?.email}</p>
              <p className="text-slate-500 font-normal mt-1">{client?.address}</p>
            </div>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Job Site Location</span>
            <div className="font-semibold text-slate-900 space-y-1">
              <p className="text-sm">{project?.name}</p>
              <p className="flex items-center space-x-1 font-normal text-slate-600 mt-1">
                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>{project?.job_site_address || client?.address}</span>
              </p>
              {project?.desired_start_date && (
                <p className="flex items-center space-x-1 font-normal text-slate-600">
                  <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>Target Start: {project.desired_start_date}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Client Message */}
        {version.client_message && (
          <div className="bg-blue-50/40 p-5 rounded-xl border border-blue-100 text-xs leading-relaxed text-slate-700 font-medium">
            <p className="font-bold text-slate-900 mb-1">Message from Schmidt Construction:</p>
            "{version.client_message}"
          </div>
        )}

        {/* Scope of Work */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2 uppercase tracking-wide">Scope of Work</h3>
          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
            {version.scope_of_work || 'Scope description is blank.'}
          </p>
        </div>

        {/* Line Items Table */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2 uppercase tracking-wide">Detailed Estimate Cost Breakdown</h3>
          
          <div className="overflow-hidden border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-4">Description</th>
                  <th className="py-2.5 px-2 text-right w-16">Qty</th>
                  <th className="py-2.5 px-2 text-left w-14">Unit</th>
                  <th className="py-2.5 px-4 text-right w-28">Total Cost ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {baseItems.map((item) => {
                  const rawCost = item.quantity * item.unit_cost;
                  const markupFactor = 1 + (item.markup_percent / 100);
                  const totalCost = rawCost * markupFactor;

                  return (
                    <tr key={item.id}>
                      <td className="py-3 px-4">{item.description}</td>
                      <td className="py-3 px-2 text-right">{Number(item.quantity)}</td>
                      <td className="py-3 px-2 text-left uppercase text-slate-500 text-[10px]">{item.unit}</td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-900">
                        ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Optional Add-ons List */}
        {optionalItems.length > 0 && (
          <div className="space-y-4 avoid-break">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2 uppercase tracking-wide">Optional Upgrades / Add-on Options</h3>
            <p className="text-xs text-slate-500">Check the items you would like to include in this contract. The total price below will adjust automatically.</p>
            
            <div className="space-y-3.5">
              {optionalItems.map((item) => {
                const rawCost = item.quantity * item.unit_cost;
                const markupFactor = 1 + (item.markup_percent / 100);
                const totalCost = rawCost * markupFactor;
                const isSelected = !!selectedOptionalIds[item.id];

                return (
                  <div 
                    key={item.id} 
                    className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50/10' 
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start space-x-3 text-xs">
                      <input
                        type="checkbox"
                        disabled={proposal.status === 'Accepted'}
                        checked={isSelected}
                        onChange={() => toggleOptionalItem(item.id)}
                        className="h-4.5 w-4.5 text-blue-600 rounded border-slate-350 focus:ring-blue-500 shrink-0 mt-0.5 no-print cursor-pointer"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block">{item.description}</span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">Quantity: {Number(item.quantity)} {item.unit}</span>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-slate-900 whitespace-nowrap">
                      +${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Clauses - Assumptions, Exclusions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs avoid-break">
          {version.assumptions && (
            <div className="space-y-2">
              <span className="font-bold text-slate-900 uppercase tracking-wider block border-b border-slate-200 pb-1">Assumptions & Specifications</span>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{version.assumptions}</p>
            </div>
          )}
          {version.exclusions && (
            <div className="space-y-2">
              <span className="font-bold text-slate-900 uppercase tracking-wider block border-b border-slate-200 pb-1">Exclusions & Work Limitations</span>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{version.exclusions}</p>
            </div>
          )}
        </div>

        {/* Timeline & Payment Terms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs avoid-break">
          {version.timeline && (
            <div className="space-y-2">
              <span className="font-bold text-slate-900 uppercase tracking-wider block border-b border-slate-200 pb-1">Estimated Timeline</span>
              <p className="text-slate-600 leading-relaxed">{version.timeline}</p>
            </div>
          )}
          {version.payment_terms && (
            <div className="space-y-2">
              <span className="font-bold text-slate-900 uppercase tracking-wider block border-b border-slate-200 pb-1">Payment Schedule & Schedule Terms</span>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{version.payment_terms}</p>
            </div>
          )}
        </div>

        {/* Warranty Notes */}
        {version.warranty_notes && (
          <div className="text-xs space-y-2 avoid-break border-t border-slate-100 pt-6">
            <span className="font-bold text-slate-900 uppercase tracking-wider block border-b border-slate-200 pb-1">Workmanship & Material Warranty</span>
            <p className="text-slate-600 leading-relaxed">{version.warranty_notes}</p>
          </div>
        )}

        {/* Price Calculations Column */}
        <div className="border-t-2 border-slate-900 pt-6 flex flex-col items-end gap-3 text-xs font-semibold avoid-break">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-slate-500">
              <span>Base Estimate Subtotal</span>
              <span>${Number(version.subtotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            
            {Number(version.tax) > 0 && (
              <div className="flex justify-between text-slate-500">
                <span>Fees / Permit Cost Additions</span>
                <span>+${Number(version.tax).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            )}

            {Number(version.discount) > 0 && (
              <div className="flex justify-between text-slate-500">
                <span>Savings Discount</span>
                <span className="text-green-600">-${Number(version.discount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            )}

            {optionalItems.some(i => selectedOptionalIds[i.id]) && (
              <div className="flex justify-between text-slate-500 border-t border-dashed border-slate-200 pt-2">
                <span>Selected Upgrades</span>
                <span>
                  +${(getActiveTotal() - Number(version.total)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}

            <div className="flex justify-between items-baseline pt-2 border-t border-slate-900 text-sm">
              <span className="font-bold text-slate-900">Total Contract Value</span>
              <span className="text-xl font-extrabold text-slate-950">
                ${getActiveTotal().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* SIGNATURE ACCEPTANCE AREA */}
        <div className="border-t-2 border-slate-900 pt-8 avoid-break">
          {proposal.status === 'Accepted' ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex flex-col items-center justify-center text-center text-xs">
              <CheckCircle className="h-10 w-10 text-green-600 mb-2" />
              <h4 className="font-bold text-green-800 text-sm">Estimate Proposal Accepted</h4>
              <p className="text-slate-600 mt-1 max-w-sm">
                This contract is signed. Mobilization prep will commence per the outlined schedule.
              </p>
              
              <div className="mt-4 pt-4 border-t border-green-200/50 w-full max-w-xs text-left font-semibold text-slate-700 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Signatory:</span>
                  <span className="font-bold text-slate-950 italic">{clientNameInput || client?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Accepted Date:</span>
                  <span>{new Date(version.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">IP / Secure Token:</span>
                  <span className="font-mono text-[9px] text-slate-400">{proposal.share_token.substring(0,18)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-md bg-slate-50 p-6 rounded-xl border border-slate-200/80 space-y-4 no-print text-xs">
              <h4 className="font-extrabold text-slate-900 uppercase tracking-wide flex items-center space-x-1.5">
                <Signature className="h-4.5 w-4.5 text-blue-700" />
                <span>Accept Estimate & Authorize Work</span>
              </h4>
              <p className="text-slate-600 leading-normal">
                By entering your name below and clicking Accept, you authorize Schmidt Construction to execute this scope of work under the outlined timeline, pricing, and payment terms.
              </p>

              <form onSubmit={handleAcceptProposal} className="space-y-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Type Full Name to Sign *</label>
                  <input
                    type="text"
                    required
                    value={clientNameInput}
                    onChange={(e) => setClientNameInput(e.target.value)}
                    placeholder="e.g. John R. Doe"
                    className="w-full bg-white px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500 text-sm font-semibold"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={!clientNameInput.trim() || loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-extrabold py-3 px-4 rounded-xl transition-colors cursor-pointer disabled:opacity-50 text-xs"
                >
                  {loading ? "Accepting..." : "Authorize & Sign Contract"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Portal Timeline comments (Feedback loop, Hidden on print) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 premium-shadow space-y-5 no-print">
        <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
          <MessageSquare className="h-4.5 w-4.5 text-blue-600" />
          <span>Negotiation & Questions Panel</span>
        </h3>
        <p className="text-xs text-slate-500">Have questions about dimensions, optional upgrades, or terms? Leave a note here to discuss with the Schmidt Construction estimator.</p>

        {submittedComment && (
          <div className="bg-green-50 text-green-800 border border-green-150 p-3 rounded-lg text-xs font-semibold">
            Comment submitted successfully! The estimator has been notified.
          </div>
        )}

        <form onSubmit={handleSubmitFeedback} className="space-y-4 text-xs font-semibold">
          <div>
            <textarea
              required
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Type your question or request updates here..."
              rows={3}
              className="w-full bg-white px-3 py-2.5 rounded-xl border border-slate-350 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center space-x-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <input
              type="checkbox"
              id="isChangeRequest"
              checked={isChangeRequest}
              onChange={(e) => {
                setIsChangeRequest(e.target.checked);
                if (e.target.checked) {
                  setChangeRequestText('Please revise the following: ');
                } else {
                  setChangeRequestText('');
                }
              }}
              className="h-4.5 w-4.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="isChangeRequest" className="font-bold text-slate-700 cursor-pointer">
              I am requesting specific changes/revisions to this proposal scope/price
            </label>
          </div>

          {isChangeRequest && (
            <div>
              <label className="block text-red-700 font-bold mb-1">Details of Requested Changes *</label>
              <textarea
                required
                value={changeRequestText}
                onChange={(e) => setChangeRequestText(e.target.value)}
                placeholder="What details should we modify?"
                rows={2}
                className="w-full bg-white px-3 py-2.5 border-red-200 rounded-xl border focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-5 py-3 rounded-xl transition-colors cursor-pointer"
          >
            {loading ? "Submitting..." : "Submit Feedback Note"}
          </button>
        </form>
      </div>
    </div>
  );
}
