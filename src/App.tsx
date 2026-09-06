import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useUI } from '@/store/ui';
import { useSettings } from '@/store/settings';
import { setBaseUrl } from '@/llm/openrouter';
import { useRulesets } from '@/store/rulesets';
import { useCampaign } from '@/store/campaign';
import { Toasts } from '@/components/ui';
import { HomeScreen } from '@/screens/Home';
import { OnboardingScreen } from '@/screens/Onboarding';
import { SettingsScreen } from '@/screens/Settings';
import { NewCampaignScreen } from '@/screens/NewCampaign';
import { PlayScreen } from '@/screens/Play';
import { RulesetsScreen } from '@/screens/Rulesets';
import { RulesetEditorScreen } from '@/screens/RulesetEditor';
import { RulesScreen } from '@/screens/Rules';

export function App() {
  const screen = useUI((s) => s.screen);
  const replace = useUI((s) => s.replace);
  const reduceMotion = useSettings((s) => s.reduceMotion);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setBaseUrl(useSettings.getState().baseUrl);
    const unsub = useSettings.subscribe((s) => setBaseUrl(s.baseUrl));
    (async () => {
      await useRulesets.getState().load();
      await useCampaign.getState().loadLibrary();
      if (!useSettings.getState().onboarded) replace({ name: 'onboarding' });
      setReady(true);
    })();
    return unsub;
  }, [replace]);

  useEffect(() => {
    const onVis = () => { if (document.visibilityState === 'hidden') void useCampaign.getState().flush(); };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('pagehide', onVis);
    return () => { document.removeEventListener('visibilitychange', onVis); window.removeEventListener('pagehide', onVis); };
  }, []);

  if (!ready) return <div className="app center" style={{ height: '100%' }}><div className="spinner" /></div>;

  const key = screen.name + ('id' in screen ? screen.id : '');
  return (
    <div className={`app ${reduceMotion ? 'reduce-motion' : ''}`}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={key} className="screen" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.18, ease: 'easeOut' }}>
          {screen.name === 'home' && <HomeScreen />}
          {screen.name === 'onboarding' && <OnboardingScreen />}
          {screen.name === 'settings' && <SettingsScreen />}
          {screen.name === 'new-campaign' && <NewCampaignScreen />}
          {screen.name === 'play' && <PlayScreen />}
          {screen.name === 'rulesets' && <RulesetsScreen />}
          {screen.name === 'ruleset-editor' && <RulesetEditorScreen id={screen.id} />}
          {screen.name === 'rules' && <RulesScreen id={screen.id} section={screen.section} />}
        </motion.div>
      </AnimatePresence>
      <Toasts />
    </div>
  );
}
