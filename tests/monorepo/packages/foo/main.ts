import { Service as BarService } from '@bar/service'
import { Service as ShareService } from '@share/service'
import { Service } from 'service'

console.log([Service, BarService].map((service) => service.get()).join('') === ShareService.get())
