import React, { FC, useEffect, useState } from 'react'
import { List, ListLinkItem } from '../List'

const QUERY_API = 'https://list-records.pmhonly.workers.dev/'

export const Records: FC = () => {
  const [records, setRecords] = useState<string[]>()

  const fetchRecords = async (): Promise<void> => {
    const res = await fetch(QUERY_API)
      .then((res) => res.json())

    setRecords(res)
  }

  useEffect(() => {
    void fetchRecords()
  }, [])

  if (records === undefined) {
    return (
      <List>
        <ListLinkItem href="#">
          Loading...
        </ListLinkItem>
      </List>
    )
  }

  return (
    <List>
      {records.map((v, i) =>
        <ListLinkItem key={i} href={`https://${v}`}>
          {v.replace('.pmh.codes', '') + '.'}
        </ListLinkItem>
      )}
    </List>
  )
}
