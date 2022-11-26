import React, { FC, ReactNode } from 'react'
import * as style from './style.module.scss'

interface Props {
  children: ReactNode
}

export const Container: FC<Props> = ({ children }) =>
  <div className={style.container}>
    {children}
  </div>
