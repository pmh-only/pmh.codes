import React, { FC } from 'react'
import * as style from './style.module.scss'

export const Footer: FC = () =>
  <footer className={style.footer}>
    <p>Minhyeok Park &copy; 2022.</p>
    <a href="mailto:webmaster@pmh.codes">webmaster@pmh.codes</a>
  </footer>
