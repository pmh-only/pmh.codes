import * as React from 'react'
import type { PageProps } from 'gatsby'

import { Title } from '../components/Title'
import { Footer } from '../components/Footer'
import { Trigger } from '../components/Trigger'
import { Records } from '../components/Records'
import { Container } from '../components/Container'
import { List, ListLinkItem } from '../components/List'

import 'normalize.css'
import '../styles/index.scss'

const IndexPage: React.FC<PageProps> = () => {
  return (
    <>
      <Container>
        <Title>pmh.codes*</Title>

        <List>
          <ListLinkItem href="https://portfolio.pmh.codes">
            My Portfolio
          </ListLinkItem>
        </List>

        <Trigger hiddenLabel='query dns records.'>
          <Records />
        </Trigger>
      </Container>
      <Footer />
    </>
  )
}

export default IndexPage

export { Head } from '../components/Head'
