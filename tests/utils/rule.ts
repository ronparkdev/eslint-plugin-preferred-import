export const getOptionsInjectedRule = (rule, options) => ({
  ...rule,
  create: (context) => {
    // Copy and inject options
    const injectedContext = { ...context, options }

    // Copy original prototype of context to new context
    Object.setPrototypeOf(injectedContext, Object.getPrototypeOf(context))

    // Call original create function
    return rule.create(injectedContext)
  },
})
