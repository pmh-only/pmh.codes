import type { GatsbyConfig } from 'gatsby'

const config: GatsbyConfig = {
  siteMetadata: {
    title: 'pmh.codes',
    siteUrl: 'https://pmh.codes'
  },
  plugins: [
    'gatsby-plugin-pnpm',
    'gatsby-plugin-sass'
  ]
}

export default config
