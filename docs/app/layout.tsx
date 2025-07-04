import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Banner, Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'
import './global.css'
import Logo from './icons/logo';


export const metadata = {
    // Define your metadata here
    // For more information on metadata API, see: https://nextjs.org/docs/app/building-your-application/optimizing/metadata
}

const navbar = (
    <Navbar
        logo={
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            }}>
                <Logo />
                <span>Zest</span>
            </div>
        }
        projectLink="https://github.com/ludovikallen/zest"
    />
)

export default async function RootLayout({ children }) {
    return (
        <html
            lang="en"
            dir="ltr"
            suppressHydrationWarning
        >
        <Head
            color={{
                hue: 48.1,
                saturation: 89.5,
                lightness: 70.2
            }}
            backgroundColor={{
                dark: "#000000",
                light: "#FAF9F6"
            }}
        >
            <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
            <link rel="icon" href="/favicon.svg" type="image/x-icon" />
        </Head>
        <body>
        <Layout
            navbar={navbar}
            sidebar={{ defaultMenuCollapseLevel: 1 }}
            pageMap={await getPageMap()}
            docsRepositoryBase="https://github.com/ludovikallen/zest/docs"
        >
            {children}
        </Layout>
        </body>
        </html>
    )
}