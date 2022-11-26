import React, { FC, useState } from 'react'
import { Records } from '../Records'

import * as style from './style.module.scss'

export const RecordsTrigger: FC = () => {
  const [isTrigged, setIsTrigged] = useState(false)

  if (isTrigged) return <Records />

  return (
    <button className={style.trigger} onClick={() => { setIsTrigged(true) }}>
      query dns records.
    </button>
  )
}
