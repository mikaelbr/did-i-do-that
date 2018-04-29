#!/usr/bin/env node --no-warnings --experimental-modules
import wdt, { stats } from './who-did-that';

Object = wdt(Object);
Object.is = () => true;

console.log(stats(Object));
