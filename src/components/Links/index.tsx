import React, { FC } from 'react'
import * as style from './style.module.scss'

export const Links: FC = () =>
  <ul className={style.links}>
    <li><a href="https://portfolio.pmh.codes">My Portfolio</a></li>
    <li><a href="https://remi.pmh.codes">RemiDrive</a></li>
  </ul>
