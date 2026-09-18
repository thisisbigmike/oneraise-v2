export interface ContentSection {
  heading: string;
  paragraphs: string[];
  list?: string[];
}

export interface ContentPageData {
  eyebrow: string;
  title: string;
  updated: string;
  intro: string;
  sections: ContentSection[];
}

export const termsContent: ContentPageData = {
  eyebrow: "Legal",
  title: "Terms of use",
  updated: "Last updated 1 August 2026",
  intro:
    "These terms cover everyone who uses OneRaise — donors donating to a campaign, creators publishing one, and anyone browsing. They describe what escrow does and does not promise, and what happens when a milestone is disputed.",
  sections: [
    {
      heading: "1. What OneRaise is",
      paragraphs: [
        "OneRaise is a milestone crowdfunding platform. A creator publishes a campaign broken into funded stages. A donor donations toward the whole campaign, but their money is only released to the creator one stage at a time, after that stage's evidence has stood for a dispute window with no unresolved objection.",
        "We are not a bank and do not offer investment returns. A donation is a gift toward a project, made in the expectation that the creator delivers what a stage's published terms describe.",
      ],
    },
    {
      heading: "2. Accounts",
      paragraphs: [
        "You need an account to donate or to publish a campaign. You are responsible for keeping your credentials and two-factor device secure, and for the accuracy of the information you give us at signup and in any identity check we ask a creator to complete.",
      ],
    },
    {
      heading: "3. Donations and escrow",
      paragraphs: [
        "A donation is charged to your payment method when you make it and held in escrow, not paid to the creator. Escrow releases in the amounts and on the schedule the campaign's published milestones set out — see our escrow and refund policy for the full mechanics.",
      ],
    },
    {
      heading: "4. Creator obligations",
      paragraphs: [
        "A creator must submit evidence for a milestone that matches the terms published when that stage was funded, keep their identity and payout details current, and respond to a dispute within the window a moderator sets. Campaigns that misrepresent what a milestone will deliver are removed under our community guidelines.",
      ],
    },
    {
      heading: "5. Disputes",
      paragraphs: [
        "Any donor can dispute a submitted milestone before its window closes. A dispute holds the whole milestone's escrow, not just the disputing donor's share, until a moderator records a decision. Decisions are final once recorded, though a wrong one is corrected by a new entry that supersedes it, never by editing the original.",
      ],
    },
    {
      heading: "6. Limitation of liability",
      paragraphs: [
        "OneRaise operates the escrow and dispute process in good faith but does not guarantee that a funded milestone will be completed as described. Our liability for any claim arising from a campaign is limited to fees we collected on that campaign.",
      ],
    },
    {
      heading: "7. Changes",
      paragraphs: [
        "We may update these terms as the platform changes. Material changes are announced by email at least 14 days before they take effect.",
      ],
    },
  ],
};

export const privacyContent: ContentPageData = {
  eyebrow: "Legal",
  title: "Privacy policy",
  updated: "Last updated 1 August 2026",
  intro:
    "This describes what we collect to run OneRaise, why, and who else sees it. Escrow and dispute records are kept longer than most account data because they are the evidence a moderator's decision rests on.",
  sections: [
    {
      heading: "What we collect",
      paragraphs: [
        "Account details you give us at signup, payment and payout information handled by our processor, and the evidence, messages and decisions that pass through a campaign's milestones and disputes.",
      ],
      list: [
        "Identity — name, email, country, and for creators the documents an identity check requires",
        "Payment — card or bank details, held by our payment processor, never stored on our servers in full",
        "Activity — donations, milestone reviews, disputes raised, and support requests",
      ],
    },
    {
      heading: "Why we collect it",
      paragraphs: [
        "To run escrow: matching a donation to a milestone, holding funds until a window closes, and releasing or refunding correctly.",
        "To run identity checks: confirming a creator receiving payouts is who they say they are, required before any campaign can publish.",
        "To keep an audit trail: every release, refund, and moderation decision is retained so it can be reviewed later, by you or by a regulator.",
      ],
    },
    {
      heading: "Who we share it with",
      paragraphs: [
        "Our payment processor, to move money. A moderator, to review a dispute you are party to — they see the evidence and messages relevant to that case, not your full account history. We do not sell donor or creator data to third parties.",
      ],
    },
    {
      heading: "How long we keep it",
      paragraphs: [
        "Escrow and dispute records are kept for seven years to satisfy financial recordkeeping requirements. Account details are kept while your account is active and for a limited period after closure.",
      ],
    },
    {
      heading: "Your choices",
      paragraphs: [
        "You can request an export of your data or ask us to close your account from Account settings, provided you hold no escrow. Contact us if you have a question this policy does not answer.",
      ],
    },
  ],
};

export const cookiesContent: ContentPageData = {
  eyebrow: "Legal",
  title: "Cookie policy",
  updated: "Last updated 1 August 2026",
  intro:
    "OneRaise uses a small number of cookies to keep you signed in and to remember choices like a dismissed banner. We do not use third-party advertising cookies.",
  sections: [
    {
      heading: "Essential cookies",
      paragraphs: [
        "Required for the site to function — keeping you signed in, remembering your session across pages, and protecting against cross-site request forgery. These cannot be turned off without breaking sign-in.",
      ],
    },
    {
      heading: "Preference cookies",
      paragraphs: [
        "Remember small choices, like whether you have dismissed a notice, so you are not asked again on every visit.",
      ],
    },
    {
      heading: "What we do not use",
      paragraphs: [
        "No advertising or cross-site tracking cookies, and no cookies that sell or share your browsing activity with third parties.",
      ],
    },
    {
      heading: "Managing cookies",
      paragraphs: [
        "Most browsers let you block or delete cookies in their settings. Blocking essential cookies will sign you out and may prevent donating or publishing a campaign.",
      ],
    },
  ],
};

export const guidelinesContent: ContentPageData = {
  eyebrow: "Trust & safety",
  title: "Community guidelines",
  updated: "Last updated 1 August 2026",
  intro:
    "Every campaign on OneRaise is reviewed against the same policy set our moderation team uses when a campaign is reported. Publishing one means agreeing to keep it inside these lines for as long as it holds donor escrow.",
  sections: [
    {
      heading: "1. Milestones must be real and specific",
      paragraphs: [
        'A campaign needs a defined milestone breakdown before it can publish — what each stage delivers, roughly when, and for how much. "We\'ll figure it out as we go" is not a milestone plan.',
      ],
    },
    {
      heading: "2. No guaranteed financial returns",
      paragraphs: [
        "OneRaise funds projects, not investments. A campaign may not promise donors a financial return, interest, or profit share on their donation.",
      ],
    },
    {
      heading: "3. Imagery must be the creator's own",
      paragraphs: [
        "Campaign artwork and milestone evidence must be genuine photographs of the actual project. Stock photography or images taken from elsewhere presented as original work is treated as evidence fraud.",
      ],
    },
    {
      heading: "4. Evidence must match terms",
      paragraphs: [
        "What a creator submits for a milestone must match what that milestone's published terms said it would deliver. A moderator compares the two directly when a dispute is raised.",
      ],
    },
    {
      heading: "5. Identity verification is not optional",
      paragraphs: [
        "A creator's payout account must be verified before any milestone can release to it. Campaigns from unverified creators can publish a draft but cannot accept donations until verification clears.",
      ],
    },
    {
      heading: "What happens on a breach",
      paragraphs: [
        "A moderator can pause a campaign pending changes, or take it down and refund every donor if the breach is severe. A creator barred for a takedown may appeal once, in writing, to a second moderator.",
      ],
    },
  ],
};

export const howEscrowWorksContent: ContentPageData = {
  eyebrow: "How it works",
  title: "How escrow works on OneRaise",
  updated: "Last updated 1 August 2026",
  intro:
    "The short version: your donation doesn't go to the creator when you make it. It goes into escrow, and releases in pieces as the creator proves each stage of the work.",
  sections: [
    {
      heading: "The stages of a donation",
      paragraphs: [
        "A donation moves through four stages, the same way for every campaign on the platform.",
      ],
      list: [
        "Donated — you pick a tier and pay. The charge settles, and the full amount moves into escrow.",
        "Held — nothing releases at launch. Your donation sits against the campaign's total until a milestone it funds is submitted.",
        "Submitted — the creator posts evidence for a milestone: photographs, receipts, a written note, matched against the terms that stage was funded on. A dispute window opens, typically 72 hours.",
        "Released or disputed — if the window closes with no dispute, that milestone's share of escrow moves to the creator automatically. If a donor disputes it, the whole milestone freezes until a moderator records a decision.",
      ],
    },
    {
      heading: "Why stages, not one lump sum",
      paragraphs: [
        "A creator who is paid everything up front has little reason to finish stage two once stage one is done. Splitting the raise into milestones means a creator is only ever holding the money for work they have already shown, and a donor's remaining donation stays recoverable if a project stalls.",
      ],
    },
    {
      heading: "What a dispute actually holds",
      paragraphs: [
        "A dispute freezes the entire milestone's escrow, not just the share belonging to the donor who raised it — a single donor can pause a $20,000 release while a moderator looks at the evidence. That is deliberate: it means one donor's concern gets a real hearing rather than being outvoted by everyone who didn't notice.",
      ],
    },
    {
      heading: "What happens if a milestone fails",
      paragraphs: [
        "If a moderator upholds a dispute, or a creator misses a milestone's deadline without submitting evidence, that stage's held funds are refunded to every donor, split in proportion to what they donated. Later, not-yet-funded stages simply never charge — a partially completed campaign never takes money for work it never attempted.",
      ],
    },
  ],
};

export const escrowAndRefundPolicyContent: ContentPageData = {
  eyebrow: "Legal",
  title: "Escrow and refund policy",
  updated: "Last updated 1 August 2026",
  intro:
    "The formal version of how escrow works, including exactly when a refund is issued, how it is calculated, and how long it takes to land back on your card.",
  sections: [
    {
      heading: "Escrow custody",
      paragraphs: [
        "Funds donated to a campaign are held by our payment processor in a segregated escrow account, separate from OneRaise's operating funds, until a milestone they fund either releases or is refunded.",
      ],
    },
    {
      heading: "Release conditions",
      paragraphs: [
        "A milestone's escrow releases to the creator's verified payout account when its dispute window closes with no open dispute, or when a moderator records a decision to release following a dispute. A platform fee, disclosed on the campaign page, is deducted at release.",
      ],
    },
    {
      heading: "Refund triggers",
      paragraphs: [
        "A donor's share of a milestone is refunded, pro rata to their donation, when any of the following occurs:",
      ],
      list: [
        "A moderator upholds a dispute against that milestone",
        "The creator withdraws the campaign before a milestone is funded",
        "The campaign is taken down for a guideline breach",
        "A milestone's deadline passes with no evidence submitted and no extension granted",
      ],
    },
    {
      heading: "Refund timing and method",
      paragraphs: [
        "Refunds are issued to the original payment method and typically land within 3 to 5 working days. If the original card has expired or the payout otherwise fails, we contact the donor to arrange a bank transfer instead — see a failed refund's status in your account for details.",
      ],
    },
    {
      heading: "Partial campaigns",
      paragraphs: [
        "If a campaign is discontinued after some milestones have released, only the escrow for the remaining, unreleased milestones is refunded. Funds already released for completed stages are not clawed back.",
      ],
    },
  ],
};

export const payoutTermsContent: ContentPageData = {
  eyebrow: "For creators",
  title: "Payout terms",
  updated: "Last updated 1 August 2026",
  intro:
    "What happens between a milestone releasing and money reaching your bank account, and what we need from you before it can.",
  sections: [
    {
      heading: "Before your first payout",
      paragraphs: [
        "Every creator completes an identity check before a campaign can go live: a photo ID, proof of address, and a bank statement matching the account you'll be paid into. We re-verify yearly and whenever you change your payout account.",
      ],
    },
    {
      heading: "Platform fee",
      paragraphs: [
        "OneRaise takes a 2.5% fee from each milestone at the moment it releases — nothing is charged until a stage actually pays out, so an unfunded or refunded milestone costs you nothing.",
      ],
    },
    {
      heading: "Timing",
      paragraphs: [
        "Funds typically land in your account two working days after a milestone releases. International transfers can take longer depending on your bank and currency.",
      ],
    },
    {
      heading: "Changing your payout account",
      paragraphs: [
        "You can change the account a campaign pays out to from Account settings. Doing so pauses any pending release for 72 hours while we re-run identity checks against the new account.",
      ],
    },
    {
      heading: "Tax",
      paragraphs: [
        "You are responsible for reporting and paying any tax owed on funds you receive through OneRaise. We can provide a statement of your payout history on request but do not file on your behalf.",
      ],
    },
  ],
};
