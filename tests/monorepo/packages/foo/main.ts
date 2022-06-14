import { Service } from 'service'
import { Service as BarService } from '@bar/service'
import { Service as ShareService } from '@share/service'

console.log([Service, BarService].map((service) => service.get()).join('') === ShareService.get())
