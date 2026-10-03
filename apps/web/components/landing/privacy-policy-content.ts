import type { LegalDocumentMeta } from './legal-document'

const SERVICE_NAME = 'Socialista'
const WEBSITE = 'https://socialista.app'
const CONTACT_EMAIL = 'hello@socialista.app'

export const PRIVACY_POLICY_DOCUMENT: LegalDocumentMeta = {
  title: 'Privacy Policy',
  description:
    'How Socialista collects, uses, shares, and protects personal information when you use our website, studio, and connected social publishing features.',
  effectiveDate: 'October 3, 2026',
  lastUpdated: 'October 3, 2026',
  intro: [
    `This Privacy Policy describes how ${SERVICE_NAME} ("${SERVICE_NAME}," "we," "us," or "our") processes personal information when you visit [${WEBSITE}](${WEBSITE}), create an account, use our AI content studio, connect social accounts, purchase a subscription, or otherwise interact with our products and services (collectively, the "Services").`,
    `By accessing or using the Services, you acknowledge that you have read this Privacy Policy. If you do not agree with our practices, please do not use the Services. Where required by law, we will obtain your consent for specific processing activities.`,
    `This policy should be read together with our [Terms of Service](/terms). Capitalized terms used but not defined here have the meanings given in the Terms.`,
  ],
  sections: [
    {
      id: 'controller',
      title: 'Who we are and how to contact us',
      blocks: [
        {
          type: 'paragraph',
          text: `${SERVICE_NAME} is the data controller for personal information described in this policy, except where we process information solely on behalf of a customer workspace (for example, when enterprise customers determine how end-user data is used).`,
        },
        {
          type: 'paragraph',
          text: `For privacy questions, requests to exercise your rights, complaints, or general support, contact us at [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL}). You may also write to us at the mailing address published on ${WEBSITE}.`,
        },
        {
          type: 'paragraph',
          text: 'If you are in the European Economic Area (EEA), United Kingdom, or Switzerland and we are required to appoint a representative, details will be posted on our website or provided on request.',
        },
      ],
    },
    {
      id: 'scope',
      title: 'Scope and roles',
      blocks: [
        {
          type: 'paragraph',
          text: 'This policy applies to personal information we collect through the Services, sales and marketing communications, support channels, and events where we identify ourselves as Socialista.',
        },
        {
          type: 'paragraph',
          text: 'It does not apply to third-party websites, apps, or social networks you connect to or publish through. Those platforms have their own privacy policies and terms. When you connect a social account, you authorize us to access and process data from that platform as described below and as permitted by your settings on the platform.',
        },
        {
          type: 'paragraph',
          text: 'If you use the Services on behalf of an organization, that organization may control certain workspace data. In those cases, the organization is responsible for its own compliance program and for providing notices to its users.',
        },
      ],
    },
    {
      id: 'definitions',
      title: 'Key definitions',
      blocks: [
        {
          type: 'list',
          items: [
            '"Personal information" (or "personal data") means information that identifies, relates to, or could reasonably be linked with an individual or household, as defined by applicable law.',
            '"Customer Content" means prompts, brand assets, product information, media files, posts, captions, and other materials you or your workspace submit to the Services.',
            '"Generated Content" means outputs produced by our AI and creative tools based on your inputs and settings.',
            '"Connected Accounts" means third-party social or advertising accounts you link for publishing, analytics, or authentication.',
            '"Usage Data" means technical and interaction data generated when you use the Services.',
          ],
        },
      ],
    },
    {
      id: 'information-we-collect',
      title: 'Information we collect',
      blocks: [
        {
          type: 'paragraph',
          text: 'We collect information in three main ways: (1) you provide it to us, (2) we collect it automatically when you use the Services, and (3) we receive it from third parties such as sign-in providers, payment processors, and social platforms.',
        },
        {
          type: 'paragraph',
          text: 'Account and profile information. When you register, we collect information such as your name, email address, password (stored in hashed form), profile photo, timezone, and workspace membership details. If you sign in with a third-party identity provider (such as Google, GitHub, or X/Twitter), we receive profile elements that provider shares with us according to your consent on that provider.',
        },
        {
          type: 'paragraph',
          text: 'Billing and transaction information. If you purchase a paid plan, our payment partner (currently Polar) processes payment card or wallet details and billing metadata. We receive subscription status, plan tier, invoices, tax identifiers you provide, and transaction history—not full payment card numbers.',
        },
        {
          type: 'paragraph',
          text: 'Customer Content and workspace data. We process content you upload or create, including images, videos, audio, text prompts, brand guidelines, product catalogs, skills, influencer configurations, scheduled posts, publishing settings, and collaboration data within workspaces and projects.',
        },
        {
          type: 'paragraph',
          text: 'Connected Account and platform data. When you connect social channels (such as Facebook, Instagram, TikTok, Threads, or LinkedIn), we collect OAuth tokens, account identifiers, display names, profile metadata, publishing permissions, and—depending on the connection—post performance metrics, audience summaries, and content required to publish on your behalf. We access only the data needed to provide the features you enable.',
        },
        {
          type: 'paragraph',
          text: 'Usage Data. We automatically collect device and log information, including IP address, browser type, operating system, device identifiers, pages viewed, feature usage, referral URLs, crash reports, and timestamps. We use cookies and similar technologies as described in the Cookies section.',
        },
        {
          type: 'paragraph',
          text: 'Communications. If you contact support, request a demo, or subscribe to marketing emails, we process the content of your messages, your contact details, and related metadata.',
        },
        {
          type: 'paragraph',
          text: 'We do not intentionally collect sensitive categories of personal information (such as government ID numbers, precise health data, or biometric templates for identification) unless you voluntarily include them in Customer Content or we are legally required to process them.',
        },
      ],
    },
    {
      id: 'sources',
      title: 'Sources of information',
      blocks: [
        {
          type: 'list',
          items: [
            'Directly from you when you create an account, configure the studio, upload media, connect accounts, or communicate with us.',
            'Automatically through cookies, logs, and similar technologies when you use the Services.',
            'From authentication and social platform partners when you choose to connect those services.',
            'From payment processors and fraud-prevention providers when you make purchases.',
            'From service providers that host infrastructure, deliver email, run background jobs, or provide AI inference on our behalf.',
            'From other members of your workspace when they invite you or share content with you.',
          ],
        },
      ],
    },
    {
      id: 'how-we-use',
      title: 'How we use personal information',
      blocks: [
        {
          type: 'paragraph',
          text: 'We use personal information for the following purposes, depending on your relationship with us and the features you use:',
        },
        {
          type: 'list',
          items: [
            'Provide, operate, maintain, and secure the Services, including authentication, workspace collaboration, media storage, scheduling, and publishing.',
            'Generate, edit, and deliver AI-assisted creatives and captions based on your instructions and Customer Content.',
            'Process subscriptions, credits, usage limits, taxes, and billing disputes.',
            'Connect to third-party platforms at your direction to publish content and display analytics.',
            'Monitor performance, debug errors, prevent abuse, enforce our Terms, and protect the rights and safety of users and the public.',
            'Communicate with you about the Services, including transactional messages, security alerts, and—with your consent or as permitted by law—marketing.',
            'Improve and develop the Services, including training tuning, quality evaluation, and feature research using aggregated or de-identified data where possible.',
            'Comply with legal obligations, respond to lawful requests, and establish, exercise, or defend legal claims.',
          ],
        },
        {
          type: 'paragraph',
          text: 'We do not use Customer Content to train generalized third-party foundation models for unrelated products unless we clearly disclose that practice and obtain any consent required by law. We may use subprocessors and model providers to process prompts and media solely to deliver the feature you request.',
        },
      ],
    },
    {
      id: 'legal-bases',
      title: 'Legal bases for processing (EEA, UK, and Switzerland)',
      blocks: [
        {
          type: 'paragraph',
          text: 'If you are located in the EEA, UK, or Switzerland, we process personal data only when we have a valid legal basis:',
        },
        {
          type: 'list',
          items: [
            'Contract: processing necessary to provide the Services you request, including account creation, content generation, publishing, and billing.',
            'Legitimate interests: securing the Services, improving features, preventing fraud, and marketing to business users in a balanced way that respects your rights. You may object to processing based on legitimate interests as described in Your rights.',
            'Consent: where required for optional cookies, certain marketing, or connecting third-party accounts when consent is the appropriate basis.',
            'Legal obligation: complying with tax, accounting, anti-fraud, and regulatory requirements.',
          ],
        },
      ],
    },
    {
      id: 'ai-processing',
      title: 'AI and automated processing',
      blocks: [
        {
          type: 'paragraph',
          text: 'Socialista uses automated systems, including machine learning models operated by us and our infrastructure partners, to generate and transform content, transcribe audio, analyze brand context, and suggest captions or hooks. Outputs may be inaccurate or inappropriate; you are responsible for reviewing Generated Content before publishing.',
        },
        {
          type: 'paragraph',
          text: 'Inputs you provide (prompts, product details, media, and brand settings) may be transmitted to subprocessors for inference, storage, and delivery. We implement contractual and technical safeguards designed to limit use to providing the Services.',
        },
        {
          type: 'paragraph',
          text: 'Where applicable law grants rights related to automated decision-making, you may contact us to request human review of decisions that produce legal or similarly significant effects. Our core creative tools do not typically make such decisions about individuals without human involvement.',
        },
      ],
    },
    {
      id: 'sharing',
      title: 'How we share personal information',
      blocks: [
        {
          type: 'paragraph',
          text: 'We do not sell your personal information. We do not share personal information for cross-context behavioral advertising as those terms are defined under U.S. state privacy laws, except as disclosed here or with your direction.',
        },
        {
          type: 'paragraph',
          text: 'We may share personal information with:',
        },
        {
          type: 'list',
          items: [
            'Service providers and subprocessors that host our application, store media, send email (such as Resend), process payments (Polar), run background jobs (such as Trigger.dev), provide AI inference, analytics, customer support tools, and security monitoring—bound by confidentiality and data processing terms.',
            'Connected social and identity platforms when you authorize publishing, analytics, or sign-in.',
            'Other members of your workspace according to your permissions and workspace settings.',
            'Professional advisers (lawyers, accountants, insurers) under confidentiality obligations.',
            'Authorities, regulators, or parties to litigation when we believe disclosure is required by law or necessary to protect rights, safety, and integrity.',
            'Successors in connection with a merger, acquisition, financing, or sale of assets, subject to this policy or successor notice.',
          ],
        },
        {
          type: 'paragraph',
          text: 'We may publish aggregated or de-identified information that cannot reasonably identify you.',
        },
      ],
    },
    {
      id: 'social-platforms',
      title: 'Social platform connections',
      blocks: [
        {
          type: 'paragraph',
          text: 'When you connect a social account, you instruct us to exchange data with that platform’s APIs. Data we receive may include account identifiers, access tokens, content you choose to publish, and performance metrics. We store tokens securely and refresh or revoke them according to platform rules and your disconnect actions.',
        },
        {
          type: 'paragraph',
          text: 'Publishing on your behalf occurs only when you schedule or approve posts (or enable automation features you configure). You remain responsible for complying with each platform’s terms, community standards, and advertising policies.',
        },
        {
          type: 'paragraph',
          text: 'If you disconnect an account, we delete or deactivate associated tokens within a reasonable period, subject to backup retention and legal holds.',
        },
      ],
    },
    {
      id: 'cookies',
      title: 'Cookies and similar technologies',
      blocks: [
        {
          type: 'paragraph',
          text: 'We and our partners use cookies, local storage, and similar technologies to keep you signed in, remember preferences, secure OAuth flows, measure usage, and improve the Services.',
        },
        {
          type: 'list',
          items: [
            'Strictly necessary: authentication sessions, security tokens, load balancing, and fraud prevention. These are required for core functionality.',
            'Functional: timezone, UI preferences, and workspace context.',
            'Analytics: understanding feature adoption and diagnosing errors. Where required, we request consent before setting non-essential analytics cookies.',
          ],
        },
        {
          type: 'paragraph',
          text: 'You can control cookies through browser settings. Blocking strictly necessary cookies may prevent you from using parts of the Services. Where we use consent banners, you may withdraw consent at any time without affecting the lawfulness of processing before withdrawal.',
        },
      ],
    },
    {
      id: 'retention',
      title: 'Data retention',
      blocks: [
        {
          type: 'paragraph',
          text: 'We retain personal information for as long as needed to provide the Services, fulfill the purposes described in this policy, comply with legal obligations, resolve disputes, and enforce agreements.',
        },
        {
          type: 'list',
          items: [
            'Account data is retained while your account is active and for a limited period afterward to allow reactivation and backup integrity.',
            'Customer Content and Generated Content are retained according to your workspace settings and product features (including exports and deletions you initiate).',
            'Billing records may be kept longer where required for tax and accounting law.',
            'Logs and security records are retained for a shorter operational window unless needed for incident investigation.',
          ],
        },
        {
          type: 'paragraph',
          text: 'When you delete content or close an account, we delete or de-identify information within a commercially reasonable timeframe, except where retention is required by law or permitted for legitimate backup, audit, or security purposes.',
        },
      ],
    },
    {
      id: 'security',
      title: 'Security',
      blocks: [
        {
          type: 'paragraph',
          text: 'We implement administrative, technical, and organizational measures designed to protect personal information, including encryption in transit, access controls, secrets management, and monitoring. No method of transmission or storage is completely secure; we cannot guarantee absolute security.',
        },
        {
          type: 'paragraph',
          text: `You are responsible for safeguarding your credentials and workspace access. Notify us promptly at [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL}) if you believe your account has been compromised.`,
        },
      ],
    },
    {
      id: 'international-transfers',
      title: 'International data transfers',
      blocks: [
        {
          type: 'paragraph',
          text: 'We may process and store information in the United States and other countries where we or our service providers operate. These locations may have data protection laws that differ from those in your jurisdiction.',
        },
        {
          type: 'paragraph',
          text: 'When we transfer personal data from the EEA, UK, or Switzerland to countries not recognized as providing adequate protection, we rely on appropriate safeguards such as the European Commission’s Standard Contractual Clauses, the UK International Data Transfer Addendum, or other lawful mechanisms, supplemented by technical and organizational measures where appropriate.',
        },
        {
          type: 'paragraph',
          text: `You may request a copy of relevant transfer safeguards by contacting [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL}).`,
        },
      ],
    },
    {
      id: 'your-rights',
      title: 'Your privacy rights',
      blocks: [
        {
          type: 'paragraph',
          text: 'Depending on where you live, you may have rights to access, correct, delete, restrict, or object to certain processing, to data portability, and to withdraw consent where processing is consent-based. You may also have the right to lodge a complaint with a supervisory authority.',
        },
        {
          type: 'paragraph',
          text: `To exercise rights, email [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL}) with sufficient information to verify your identity and describe your request. We respond within the timeframe required by applicable law. Authorized agents may submit requests where permitted, with proof of authority.`,
        },
        {
          type: 'paragraph',
          text: 'We may deny requests that are manifestly unfounded, excessive, or where we are permitted or required to retain data. We will explain the basis for any denial when required.',
        },
      ],
    },
    {
      id: 'us-state-privacy',
      title: 'U.S. state privacy notices',
      blocks: [
        {
          type: 'paragraph',
          text: 'Residents of California, Colorado, Connecticut, Virginia, Utah, and other states with comprehensive privacy laws may have additional rights, including the right to know categories of personal information collected, sources, purposes, and recipients; to delete personal information; to correct inaccuracies; and to opt out of certain processing.',
        },
        {
          type: 'paragraph',
          text: 'We do not sell personal information and do not share it for cross-context behavioral advertising as defined under the California Consumer Privacy Act (CCPA), as amended by the CPRA. We do not use or disclose sensitive personal information for purposes requiring a "limit the use" right under CPRA, except as permitted by law.',
        },
        {
          type: 'paragraph',
          text: 'Categories collected in the preceding 12 months may include identifiers, commercial information, internet activity, audio/visual information in Customer Content, professional information related to your business use, and inferences used to improve the Services. We collect these categories for the business and commercial purposes described in this policy.',
        },
        {
          type: 'paragraph',
          text: 'California residents may designate an authorized agent to submit requests on their behalf. We do not discriminate against you for exercising privacy rights.',
        },
        {
          type: 'paragraph',
          text: 'Nevada residents may opt out of the sale of covered information. We do not sell covered information as defined under Nevada law. You may still contact us with questions.',
        },
      ],
    },
    {
      id: 'children',
      title: "Children's privacy",
      blocks: [
        {
          type: 'paragraph',
          text: `The Services are not directed to children under 16 (or the minimum age required in your jurisdiction to consent to information services without parental approval). We do not knowingly collect personal information from children. If you believe a child has provided us personal information, contact [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL}) and we will take appropriate steps to delete it.`,
        },
      ],
    },
    {
      id: 'third-party-links',
      title: 'Third-party links and integrations',
      blocks: [
        {
          type: 'paragraph',
          text: 'The Services may contain links to third-party websites, plugins, or integrations. Their privacy practices are governed by their own policies. We encourage you to review those policies before providing personal information to third parties.',
        },
      ],
    },
    {
      id: 'changes',
      title: 'Changes to this policy',
      blocks: [
        {
          type: 'paragraph',
          text: 'We may update this Privacy Policy from time to time. If we make material changes, we will provide notice through the Services, by email, or by other reasonable means. The "Last updated" date at the top indicates when this policy was last revised. Continued use after the effective date of an update constitutes acceptance of the revised policy, except where further consent is required by law.',
        },
      ],
    },
    {
      id: 'contact',
      title: 'Contact',
      blocks: [
        {
          type: 'paragraph',
          text: `Questions about this Privacy Policy or our privacy practices: [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL}). Website: [${WEBSITE}](${WEBSITE}).`,
        },
      ],
    },
  ],
}
