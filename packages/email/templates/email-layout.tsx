import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from 'react-email'
import type { ReactNode } from 'react'

const FONT =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Helvetica, Arial, sans-serif"

export type EmailLayoutProps = {
  preview: string
  heading: string
  children: ReactNode
  cta?: {
    label: string
    href: string
  }
  footerNote?: string
}

export function EmailLayout({ preview, heading, children, cta, footerNote }: EmailLayoutProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind>
        <Body className="m-0 bg-[#f5f5f7] py-[48px]" style={{ fontFamily: FONT }}>
          <Container className="mx-auto w-full max-w-[520px] px-[24px]">
            <Text className="m-0 mb-[32px] text-center text-[12px] font-semibold tracking-[0.14em] text-[#1d1d1f]">
              SOCIALISTA
            </Text>
            <Section className="rounded-[20px] bg-white px-[40px] py-[40px]">
              <Heading className="m-0 mb-[16px] text-[28px] font-semibold leading-[1.15] tracking-[-0.03em] text-[#1d1d1f]">
                {heading}
              </Heading>
              {children}
              {cta ? (
                <Section className="mt-[32px]">
                  <Link
                    href={cta.href}
                    className="inline-block rounded-full bg-[#1d1d1f] px-[22px] py-[12px] text-center text-[15px] font-medium leading-none text-white no-underline"
                  >
                    {cta.label}
                  </Link>
                </Section>
              ) : null}
            </Section>
            <Text className="mt-[32px] mb-0 text-center text-[12px] leading-[20px] text-[#86868b]">
              {footerNote ?? 'This email was sent by Socialista.'}
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export function EmailParagraph({ children }: { children: ReactNode }) {
  return (
    <Text className="m-0 mb-[14px] text-[15px] leading-[24px] text-[#6e6e73]">{children}</Text>
  )
}

export function EmailEmphasis({ children }: { children: ReactNode }) {
  return <span className="font-medium text-[#1d1d1f]">{children}</span>
}
