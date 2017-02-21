import * as inquirer from 'inquirer'

export const prompt = function(option) {
  return inquirer.prompt(option)
}
