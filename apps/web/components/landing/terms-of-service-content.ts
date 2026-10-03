import type { LegalDocumentMeta } from './legal-document'

const SERVICE_NAME = 'Socialista'
const WEBSITE = 'https://socialista.app'
const CONTACT_EMAIL = 'hello@socialista.app'

export const TERMS_OF_SERVICE_DOCUMENT: LegalDocumentMeta = {
  title: 'Terms of Service',
  description:
    'The agreement governing your access to Socialista’s AI content studio, workspace collaboration, subscriptions, and social publishing features.',
  effectiveDate: 'October 3, 2026',
  lastUpdated: 'October 3, 2026',
  intro: [
    `These Terms of Service ("Terms") are a binding agreement between you and the entity operating ${SERVICE_NAME} ("${SERVICE_NAME}," "we," "us," or "our") governing access to and use of our website at [${WEBSITE}](${WEBSITE}), applications, APIs, and related products (collectively, the "Services").`,
    `By creating an account, clicking to accept, or using the Services, you agree to these Terms and our [Privacy Policy](/privacy). If you use the Services on behalf of an organization, you represent that you have authority to bind that organization, and "you" includes the organization.`,
    `If you do not agree to these Terms, do not access or use the Services.`,
  ],
  sections: [
    {
      id: 'eligibility',
      title: 'Eligibility and accounts',
      blocks: [
        {
          type: 'paragraph',
          text: 'You must be at least 16 years old (or the minimum age required in your jurisdiction to enter a binding contract without parental consent) and capable of forming a binding contract. You may not use the Services if you are barred under applicable law or if we have previously suspended or terminated your account for violation of these Terms.',
        },
        {
          type: 'paragraph',
          text: `You must provide accurate registration information and keep it current. You are responsible for maintaining the confidentiality of your credentials and for all activity under your account. Notify us immediately at [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL}) if you suspect unauthorized access.`,
        },
        {
          type: 'paragraph',
          text: 'Workspaces may have multiple members. Workspace owners and administrators control invitations, roles, and billing. You are responsible for how your organization configures access and for actions taken by users you authorize.',
        },
      ],
    },
    {
      id: 'services',
      title: 'The Services',
      blocks: [
        {
          type: 'paragraph',
          text: `${SERVICE_NAME} provides tools to create, edit, and manage marketing and social content—including AI-assisted UGC-style video, static ads, slideshows, images, captions, and related assets—and to schedule and publish content to connected social channels, subject to feature availability in your plan.`,
        },
        {
          type: 'paragraph',
          text: 'We may add, change, or discontinue features at any time. Beta or experimental features may be offered "as is," may be less reliable, and may be modified or withdrawn without notice.',
        },
        {
          type: 'paragraph',
          text: 'The Services depend on third-party platforms (social networks, identity providers, payment processors, cloud infrastructure, and AI model providers). We are not responsible for third-party outages, policy changes, API limits, or account actions taken by those platforms.',
        },
      ],
    },
    {
      id: 'subscriptions',
      title: 'Subscriptions, credits, and billing',
      blocks: [
        {
          type: 'paragraph',
          text: 'Paid plans, credits, usage limits, and seat counts are described on our pricing pages and in-product. By subscribing, you authorize us and our payment processor (currently Polar) to charge applicable fees, taxes, and recurring subscription amounts using your selected payment method.',
        },
        {
          type: 'paragraph',
          text: 'Subscriptions renew automatically at the end of each billing period unless you cancel before renewal. Cancellation stops future charges but does not entitle you to a refund for the current period except where required by law or expressly stated at purchase.',
        },
        {
          type: 'paragraph',
          text: 'Credits and promotional allowances may expire, be non-transferable, and are consumed when you run generations or other metered features. We may change pricing, plans, and metering with advance notice where required; continued use after the effective date constitutes acceptance of new pricing for renewal periods.',
        },
        {
          type: 'paragraph',
          text: 'You are responsible for all taxes associated with your purchase other than taxes based on our net income. If payment fails, we may suspend access until amounts are paid.',
        },
      ],
    },
    {
      id: 'acceptable-use',
      title: 'Acceptable use',
      blocks: [
        {
          type: 'paragraph',
          text: 'You may use the Services only for lawful purposes and in accordance with these Terms. You agree not to, and not to permit others to:',
        },
        {
          type: 'list',
          items: [
            'Violate any law, regulation, or third-party rights, including intellectual property, privacy, publicity, and anti-spam rules.',
            'Upload, generate, publish, or promote content that is illegal, fraudulent, harassing, hateful, exploitative, deceptive, or that depicts non-consensual intimate imagery or minors in sexual contexts.',
            'Impersonate any person or entity, misrepresent affiliation, or create synthetic personas intended to deceive consumers without appropriate disclosure where required by law or platform policy.',
            'Attempt to gain unauthorized access to the Services, other accounts, or our or third-party systems; probe, scan, or test vulnerabilities; or interfere with operation or security.',
            'Reverse engineer, decompile, or attempt to extract source code or underlying models except where prohibited restrictions are unenforceable by law.',
            'Use automated means (bots, scrapers) to access the Services except through documented APIs we expressly permit.',
            'Resell, sublicense, or provide the Services as a standalone offering to third parties without our written agreement.',
            'Circumvent usage limits, credit meters, or access controls.',
          ],
        },
        {
          type: 'paragraph',
          text: 'We may investigate violations and cooperate with law enforcement. We may remove content, disable publishing, or suspend or terminate accounts without liability if we reasonably believe you have violated these Terms or pose risk to the Services or others.',
        },
      ],
    },
    {
      id: 'customer-content',
      title: 'Customer Content and Generated Content',
      blocks: [
        {
          type: 'paragraph',
          text: '"Customer Content" means materials you or your workspace submit to the Services, including prompts, media, brand data, posts, and scheduling instructions. "Generated Content" means outputs produced by the Services based on your inputs and settings.',
        },
        {
          type: 'paragraph',
          text: 'As between you and Socialista, you retain ownership of Customer Content and, to the extent permitted by law, Generated Content, subject to third-party rights in underlying materials and platform terms. You represent and warrant that you have all rights necessary to submit Customer Content and to use Generated Content as you intend, including for advertising and publication.',
        },
        {
          type: 'paragraph',
          text: 'You grant Socialista a worldwide, non-exclusive, royalty-free license to host, store, reproduce, modify (for technical formatting), display, and distribute Customer Content and Generated Content solely to operate, secure, improve, and provide the Services and as described in our Privacy Policy. This license survives termination only as needed for backup retention, legal compliance, and disputes, after which we will delete or de-identify content per our retention practices.',
        },
        {
          type: 'paragraph',
          text: 'You are solely responsible for reviewing Generated Content for accuracy, legality, and suitability before use or publication. AI outputs may be incorrect, biased, or infringe third-party rights. Socialista does not guarantee that Generated Content will be unique, error-free, or approved by any platform.',
        },
      ],
    },
    {
      id: 'social-platforms',
      title: 'Connected accounts and publishing',
      blocks: [
        {
          type: 'paragraph',
          text: 'When you connect social or advertising accounts, you authorize us to access and use platform data and to publish content on your behalf according to your instructions. Your use of each platform remains subject to that platform’s terms and policies.',
        },
        {
          type: 'paragraph',
          text: 'You are responsible for disclosures, endorsements, sponsored content labels, and compliance with advertising and consumer protection laws in every jurisdiction where your content is shown. Automated or scheduled publishing does not shift this responsibility to Socialista.',
        },
        {
          type: 'paragraph',
          text: 'We may limit or disable publishing features if a platform revokes access, changes API terms, or if we detect abuse or security risk.',
        },
      ],
    },
    {
      id: 'intellectual-property',
      title: 'Socialista intellectual property',
      blocks: [
        {
          type: 'paragraph',
          text: 'The Services, including software, design, trademarks, documentation, and proprietary workflows, are owned by Socialista or its licensors and are protected by intellectual property laws. Except for the limited rights expressly granted in these Terms, we reserve all rights.',
        },
        {
          type: 'paragraph',
          text: 'If you provide feedback or suggestions, you grant us a perpetual, irrevocable, royalty-free license to use them without restriction or compensation.',
        },
      ],
    },
    {
      id: 'copyright',
      title: 'Copyright complaints',
      blocks: [
        {
          type: 'paragraph',
          text: `We respect intellectual property rights. If you believe content on the Services infringes your copyright, send a notice to [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL}) including: (1) identification of the copyrighted work; (2) identification of the material claimed to be infringing and its location; (3) your contact information; (4) a statement of good-faith belief that use is not authorized; (5) a statement under penalty of perjury that your notice is accurate and you are authorized to act; and (6) your physical or electronic signature. We may remove content and terminate repeat infringers in appropriate circumstances.`,
        },
      ],
    },
    {
      id: 'confidentiality',
      title: 'Confidentiality',
      blocks: [
        {
          type: 'paragraph',
          text: 'Each party may receive non-public information from the other. The receiving party will use reasonable care to protect confidential information and use it only for purposes related to the Services. Confidentiality obligations do not apply to information that is public through no fault of the recipient, independently developed, or rightfully received from a third party without duty of confidentiality.',
        },
      ],
    },
    {
      id: 'disclaimers',
      title: 'Disclaimers',
      blocks: [
        {
          type: 'paragraph',
          text: 'THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE." TO THE MAXIMUM EXTENT PERMITTED BY LAW, SOCIALISTA DISCLAIMS ALL WARRANTIES, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.',
        },
        {
          type: 'paragraph',
          text: 'We do not warrant that the Services will be uninterrupted, secure, or error-free, that Generated Content will meet your requirements, or that publishing will succeed on every platform. You use AI features at your own risk.',
        },
      ],
    },
    {
      id: 'liability',
      title: 'Limitation of liability',
      blocks: [
        {
          type: 'paragraph',
          text: 'TO THE MAXIMUM EXTENT PERMITTED BY LAW, NEITHER SOCIALISTA NOR ITS AFFILIATES, OFFICERS, EMPLOYEES, AGENTS, OR LICENSORS WILL BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, DATA, GOODWILL, OR BUSINESS OPPORTUNITY, ARISING FROM OR RELATED TO THE SERVICES OR THESE TERMS, EVEN IF ADVISED OF THE POSSIBILITY.',
        },
        {
          type: 'paragraph',
          text: 'TO THE MAXIMUM EXTENT PERMITTED BY LAW, OUR TOTAL LIABILITY FOR ALL CLAIMS ARISING OUT OF OR RELATING TO THE SERVICES OR THESE TERMS IN ANY 12-MONTH PERIOD WILL NOT EXCEED THE GREATER OF (A) THE AMOUNTS YOU PAID TO SOCIALISTA FOR THE SERVICES IN THAT PERIOD OR (B) ONE HUNDRED U.S. DOLLARS (US$100).',
        },
        {
          type: 'paragraph',
          text: 'Some jurisdictions do not allow certain limitations; in those cases, our liability is limited to the fullest extent permitted by law.',
        },
      ],
    },
    {
      id: 'indemnification',
      title: 'Indemnification',
      blocks: [
        {
          type: 'paragraph',
          text: 'You will defend, indemnify, and hold harmless Socialista and its affiliates, officers, directors, employees, and agents from and against any claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys’ fees) arising from or related to: (a) your Customer Content, Generated Content, or published materials; (b) your use of the Services in violation of these Terms or applicable law; (c) your connected accounts or campaigns; or (d) any dispute between you and a third party in connection with your use of the Services.',
        },
      ],
    },
    {
      id: 'suspension',
      title: 'Suspension and termination',
      blocks: [
        {
          type: 'paragraph',
          text: 'You may stop using the Services at any time and may cancel subscriptions through account settings or by contacting support. We may suspend or terminate your access immediately if you breach these Terms, if required by law, if payment is overdue, or if continued provision creates risk to us or others.',
        },
        {
          type: 'paragraph',
          text: 'Upon termination, your right to use the Services ceases. Provisions that by their nature should survive (including ownership, disclaimers, limitation of liability, indemnification, and dispute resolution) will survive termination.',
        },
        {
          type: 'paragraph',
          text: 'We may provide reasonable opportunity to export Customer Content before deletion, subject to technical feasibility and your plan features.',
        },
      ],
    },
    {
      id: 'disputes',
      title: 'Dispute resolution and governing law',
      blocks: [
        {
          type: 'paragraph',
          text: 'These Terms are governed by the laws of the State of Delaware, United States, without regard to conflict-of-law principles, except where mandatory consumer protection laws in your country of residence apply.',
        },
        {
          type: 'paragraph',
          text: `Before filing a claim, you agree to contact us at [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL}) and attempt to resolve the dispute informally within 30 days. If informal resolution fails, either party may bring claims in the state or federal courts located in Delaware, and each party consents to personal jurisdiction there, except where prohibited by applicable law.`,
        },
        {
          type: 'paragraph',
          text: 'If you are a consumer in the EEA, UK, or another jurisdiction with mandatory local forum or mediation rights, nothing in this section limits rights you cannot waive by contract.',
        },
        {
          type: 'paragraph',
          text: 'YOU AND SOCIALISTA WAIVE ANY RIGHT TO PARTICIPATE IN A CLASS ACTION OR CLASS-WIDE ARBITRATION WHERE PERMITTED BY LAW, EXCEPT WHERE SUCH WAIVER IS PROHIBITED.',
        },
      ],
    },
    {
      id: 'export',
      title: 'Export and sanctions',
      blocks: [
        {
          type: 'paragraph',
          text: 'You may not use or export the Services except as authorized by U.S. law and the laws of the jurisdiction in which the Services are used. You represent that you are not located in, under control of, or a national or resident of any country or person subject to comprehensive U.S. sanctions.',
        },
      ],
    },
    {
      id: 'changes',
      title: 'Changes to these Terms',
      blocks: [
        {
          type: 'paragraph',
          text: 'We may modify these Terms from time to time. If changes are material, we will provide notice through the Services, by email, or by other reasonable means. The updated Terms become effective on the date stated in the notice. Your continued use after that date constitutes acceptance. If you do not agree, you must stop using the Services.',
        },
      ],
    },
    {
      id: 'miscellaneous',
      title: 'General provisions',
      blocks: [
        {
          type: 'paragraph',
          text: 'These Terms, together with the Privacy Policy and any order forms or plan-specific terms referenced at purchase, constitute the entire agreement between you and Socialista regarding the Services and supersede prior agreements on the same subject.',
        },
        {
          type: 'paragraph',
          text: 'You may not assign these Terms without our consent. We may assign these Terms in connection with a merger, acquisition, or sale of assets. Failure to enforce a provision is not a waiver. If any provision is unenforceable, the remainder remains in effect.',
        },
        {
          type: 'paragraph',
          text: `No agency, partnership, or joint venture is created by these Terms. Notices to Socialista must be sent to [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL}). We may provide notices to the email associated with your account.`,
        },
      ],
    },
    {
      id: 'contact',
      title: 'Contact',
      blocks: [
        {
          type: 'paragraph',
          text: `Questions about these Terms or the Services: [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL}). Website: [${WEBSITE}](${WEBSITE}).`,
        },
      ],
    },
  ],
}
