import React, { FC, ReactNode } from 'react'
import * as style from './style.module.scss'

interface Props {
  children: ReactNode
}

export const Title: FC<Props> = ({ children }) =>
  <header className={style.title}>
    <h1>{children}</h1>
  </header>
