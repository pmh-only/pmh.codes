import React, { FC, ReactNode, useState } from 'react'

import * as style from './style.module.scss'

interface Props {
  children: ReactNode
  hiddenLabel: string
}

export const Trigger: FC<Props> = ({ children, hiddenLabel }) => {
  const [isTrigged, setIsTrigged] = useState(false)

  const onClick = (): void => {
    setIsTrigged(true)
  }

  if (isTrigged) {
    return <>{children}</>
  }

  return (
    <button
      onClick={onClick}
      className={style.trigger}>
      {hiddenLabel}
    </button>
  )
}
