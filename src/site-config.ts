export const SiteConfig = {
  title: "Vetanytime",
  description: "Trouvez un vétérinaire rapidement en Belgique",
  prodUrl: "https://demo.nowts.app",
  appId: "vetanytime",
  domain: "demo.nowts.app",
  appIcon: "/images/icon.png",
  company: {
    name: "Vetanytime",
    address: "", // Remove if not needed
  },
  brand: {
    primary: "#00bfa9", // You can adjust this to your brand color
  },
  team: {
    image: "https://melvynx.com/images/me/twitter-en.jpg",
    website: "https://melvynx.com",
    twitter: "https://twitter.com/melvyn_me",
    name: "Melvynx",
  },
  features: {
    /**
     * If enable, you need to specify the logic of upload here : src/features/images/uploadImageAction.tsx
     * You can use Vercel Blob Storage : https://vercel.com/docs/storage/vercel-blob
     * Or you can use Cloudflare R2 : https://mlv.sh/cloudflare-r2-tutorial
     * Or you can use AWS S3 : https://mlv.sh/aws-s3-tutorial
     */
    enableImageUpload: false as boolean,
    /**
     * If enable, the client will be redirected to `/orgs` when he visits the landing page at `/`
     * The logic is located in middleware.ts
     */
    enableLandingRedirection: true as boolean,
  },
};
