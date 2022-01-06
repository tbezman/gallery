import { FC, ComponentType } from 'react';

import 'src/components/FadeTransitioner/transition.css';
import 'src/scenes/WelcomeAnimation/intro.css';
import 'src/index.css';
import 'src/scenes/NftDetailPage/model-viewer.css';

import Head from 'next/head';
import AppProvider from 'contexts/AppProvider';
import FadeTransitioner from 'components/FadeTransitioner/FadeTransitioner';
import { useRouter } from 'next/router';

const SafeHydrate: FC = ({ children }) => (
  <div suppressHydrationWarning>{typeof window === 'undefined' ? null : children}</div>
);

const App: FC<{
  Component: ComponentType;
  pageProps: Record<string, unknown>;
}> = ({ Component, pageProps }) => {
  const { asPath } = useRouter();

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Show your collection to the world." />

        <title>Gallery</title>
      </Head>
      <SafeHydrate>
        <AppProvider>
          <FadeTransitioner locationKey={asPath}>
            <Component {...pageProps} />
          </FadeTransitioner>
        </AppProvider>
      </SafeHydrate>
    </>
  );
};

export default App;
