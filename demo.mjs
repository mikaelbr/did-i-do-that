#!/usr/bin/env node --no-warnings --experimental-modules
import wdt, { stats } from './did-i-do-that';

Object = wdt(Object);
Object.is = () => true;

console.log(stats(Object));
