import type { GatsbyConfig } from 'gatsby'

const config: GatsbyConfig = {
  siteMetadata: {
    title: 'pmh.codes',
    siteUrl: 'https://pmh.codes'
  },
  plugins: [
    'gatsby-plugin-pnpm',
    'gatsby-plugin-sass',
    'gatsby-plugin-image',
    'gatsby-plugin-sharp',
    'gatsby-transformer-sharp',
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        name: 'pmh.codes',
        short_name: 'pmh.codes',
        start_url: '/',
        background_color: '#fafafa',
        theme_color: '#fafafa',
        display: 'standalone',
        icon: './static/favicon.svg'
      }
    }
  ]
}

export default config
