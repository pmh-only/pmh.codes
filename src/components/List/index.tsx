import React, { FC, ReactNode } from 'react'
import * as style from './style.module.scss'

interface ListProps {
  children: ReactNode[] | ReactNode
}

export const List: FC<ListProps> = ({ children }) =>
  <ul className={style.links}>
    {children}
  </ul>

interface ListItemProps {
  href: string
  children: string
}

export const ListLinkItem: FC<ListItemProps> = ({ href, children }) =>
  <li><a href={href}>{children}</a></li>
