"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { STUDIO, type StudioTabId } from "./content";
import { FadeIn } from "./fade-in";
import { landingBodySm, landingContentGap, landingH3 } from "./landing-classes";
import { Section } from "./section";
import { SectionHeader } from "./section-header";
import { StudioPanel } from "./studio-panel";

const FIRST_TAB: StudioTabId = STUDIO.tabs[0]?.id ?? "images";

export function LandingStudio() {
  return (
    <Section id="studio" border>
      <FadeIn>
        <SectionHeader
          title={STUDIO.title}
          description={STUDIO.description}
          align="center"
        />
      </FadeIn>

      <Tabs defaultValue={FIRST_TAB} className={`${landingContentGap} gap-8`}>
        <TabsList
          variant="line"
          className="mx-auto flex h-auto w-full max-w-3xl flex-wrap justify-center gap-1 bg-transparent p-0"
        >
          {STUDIO.tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="h-11 rounded-full border-transparent px-4 text-sm font-medium data-active:bg-muted data-active:shadow-none"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {STUDIO.tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="outline-none">
            <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-12">
              <div className="flex flex-col gap-2">
                <h3 className={landingH3}>{tab.title}</h3>
                <p className={landingBodySm}>{tab.description}</p>
              </div>
              <StudioPanel id={tab.id} />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </Section>
  );
}
