import { Service as FooService } from '../foo/service'
import { Service } from './service'
import { Service as ShareService } from '../share/service'

console.log([FooService, Service].map((service) => service.get()).join('') === ShareService.get())
