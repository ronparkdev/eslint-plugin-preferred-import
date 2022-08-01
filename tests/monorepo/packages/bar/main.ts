import { Service as FooService } from '../foo/service'
import { Service as ShareService } from '../share/service'
import { Service } from './service'

console.log([FooService, Service].map((service) => service.get()).join('') === ShareService.get())
