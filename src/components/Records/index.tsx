import React, { FC, useEffect, useState } from 'react'
import * as style from './style.module.scss'

export const Records: FC = () => {
  const [records, setRecords] = useState<string[] | undefined>(undefined)

  useEffect(() => {
    fetch('https://list-records.pmhonly.workers.dev/')
      .then(async (res) => await res.json())
      .then((res) => {
        setRecords(res as string[])
      })
      .catch(() => {})
  }, [])

  if (records === undefined) {
    return (
      <p><i>Loading...</i></p>
    )
  }

  return (
    <ul className={style.records}>
      {records.map((v, i) =>
        <li key={i}><a href={`https://${v}`}>{v.replace('.pmh.codes', '')}.</a></li>
      )}
    </ul>
  )
}
