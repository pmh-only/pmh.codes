import * as React from 'react'
import { PageProps } from 'gatsby'
import { Footer } from '../components/Footer'
import { Container } from '../components/Container'
import { Title } from '../components/Title'
import { List, ListLinkItem } from '../components/List'

const NotFoundPage: React.FC<PageProps> = () => {
  return (
    <>
      <Container>
        <Title>404 Not Found</Title>
        <List>
          <ListLinkItem href="/">
            Home
          </ListLinkItem>
        </List>
      </Container>
      <Footer />
    </>
  )
}

export default NotFoundPage

export { Head } from '../components/Head'
