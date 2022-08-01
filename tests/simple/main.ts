import { Foo } from '@share/foo'
import { Standalone as StandaloneA } from '@standalone'
import { Standalone as StandaloneD } from 'standalone'

import { Bar } from './share/bar'
import { Standalone as StandaloneB } from './standalone'
import { Standalone as StandaloneC } from './standalone' // double quote test

console.log([Foo, Bar].map((util) => util.get()).join(' '))
console.log(StandaloneA.get() === StandaloneB.get())
console.log(StandaloneA.get() === StandaloneC.get())
console.log(StandaloneA.get() === StandaloneD.get())
