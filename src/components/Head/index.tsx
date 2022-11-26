import React from 'react'
import { HeadFC } from 'gatsby'

export const Head: HeadFC = () =>
  <>
    <title>pmh.codes, Domain Portal</title>
    <meta property="og:title" content="Minhyeok's Domain" />
    <meta property="og:site_name" content="Domain Portal - pmh.codes" />
    <meta property="og:url" content="https://pmh.codes" />
    <meta property="og:description" content={'"pmh.codes" is a domain for Minhyeok\'s personal purposes'} />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="/favicon.svg" />
  </>
