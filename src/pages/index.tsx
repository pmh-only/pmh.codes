import * as React from 'react'
import type { PageProps } from 'gatsby'

import { Links } from '../components/Links'
import { Title } from '../components/Title'
import { Container } from '../components/Container'
import { RecordsTrigger } from '../components/RecordsTrigger'

import 'normalize.css'
import '../styles/index.scss'
import { Footer } from '../components/Footer'

const IndexPage: React.FC<PageProps> = () => {
  return (
    <>
      <Container>
        <Title />
        <Links />
        <RecordsTrigger />
      </Container>
      <Footer />
    </>
  )
}

export default IndexPage

export { Head } from '../components/Head'
