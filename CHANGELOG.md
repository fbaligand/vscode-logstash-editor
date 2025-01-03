# Change Log


## 1.3.1

- elasticsearch index template completion:
  - add 'data_stream' option
  - add 'runtime' option in 'dynamic_templates'
  - add 'specific to legacy index templates' description for concerned root options
- logstash pipeline configuration completion:
  - fix documentation & completion for 'action' option in elasticsearch output
- filebeat completion:
  - complete ssl options
  - add 'ssl' option to all missing inputs/outputs/modules
  - add various missing properties for inputs/outputs/modules
  - specifically add a complete and effective list of options to filestream input (especially for 'parsers' option)


## 1.3.0

- add support for Logstash 7.17 completion
- add support for Filebeat 7.17 completion
- add support for Elasticsearch 7.17 index template completion
- add support for Elasticsearch composable index templates (named also v2.0) and component templates
- add 'Since Logstash <VERSION>' info in logstash.yml and pipelines.yml
- add 'Since Elasticsearch <VERSION>' info in Elasticsearch index template fields
- several enhancements and bug fixes in filebeat.yml completion:
  - add completion for root entries present in default filebeat.yml
  - enhance inputs and modules completion
  - authorize null or ~ value for processors
  - fix completion for some string entries that were previously considered as objects
  - fix 'when' completion
  - add 'max_bytes' option


## 1.2.0

- logstash.yml and pipelines.yml: fix 'pipeline.ordered' description (thanks to camAtGitHub)
- logstash.yml and pipelines.yml: fix documentation and default values
- logstash.yml and pipelines.yml: add 'dead_letter_queue.flush_interval' setting
- Logstash pipeline configuration: fix formatting when there are curly braces between quotes
- Logstash pipeline configuration: fix completion when there is an escaped quote in configuration
- Logstash pipeline configuration: process backslashes correctly in default values and documentation
- code quality: migrate from tslint to eslint


## 1.1.3

- logstash.yml and pipelines.yml completion: allow to set environment variables references for 'boolean' and 'integer' types (no more validation warning)
- elasticsearch index template completion: remove field parameters not available in ES 7.12


## 1.1.2

- filebeat.yml completion: allow to set environment variables references for 'boolean' and 'number' types (no more validation warning)
- elasticsearch index template completion: complete field parameters list


## 1.1.1

- filebeat.yml: fix and complete 'processors' completion
- docs: new section 'Advanced tip: choose Elasticsearch index template minor version'


## 1.1.0

- add support for Logstash version 7.12
- index template completion: add new index settings and new index mappings for Elasticsearch 7.12
- filebeat.yml: fix 'cloud' completion


## 1.0.0

- add completion support for Filebeat configuration files:
  - filebeat.yml
  - filebeat.config.inputs.yml
  - filebeat.config.modules.yml
  - filebeat*/inputs.d/*.yml
  - filebeat*/modules.d/*.yml
- pipelines.yml: enhance completion to add a new pipeline entry
- docs: add a 'Troubleshooting' section


## 0.5.0

- option completion: use default value for string, boolean, array and enum option types
- option completion: add snippet completion for plugin option anywhere on the line after option
- http filter: add completion for http connectivity options (automatic_retries, ...)
- http output: add completion for undocumented options (user, password)
- 'if' completion: add /regex/ option to right operand
- formatting: ignore escaped delimiters (`\"`, `\'`, `\/`)
- pipelines.yml completion: add 'add new pipeline' default snippet


## 0.4.0

- add completion for logstash.yml and pipelines.yml files
- add completion for "pipeline" input and output
- add support for Logstash version 7.9
- index template completion: add new index settings for Elasticsearch 7.9
- for number, bytes and string_duration option values, default value is provided in completion (if available), instead of a sample value
- for boolean values, a list of choices is now provided in completion (true or false), instead of just true
- fix asciifolding token filter typo


## 0.3.0

- add support for multiple Logstash versions: 6.8, 7.2, 7.5
- add "logstash.version" configuration setting to choose Logstash version (for completion)
- add "Set Logstash Version" command (shortcut: Ctrl+Shift+L) to change Logstash version setting
- index template completion: add analyzers, tokenizers and filters completion
- index template completion: add new index settings for Elasticsearch 7.5
- add common options in completion for Logstash outputs
- add '[tags]' possible value in 'if' snippet


## 0.2.0

- add completion for Elasticsearch index template json files, based on a json schema, both for Elasticsearch 6.x and 7.x


## 0.1.0

- provide document formatting and document range formatting on Logstash pipeline configuration
- fix some cases where completion didn't work
- fix lint issues


## 0.0.3

- provide completion and documentation based on Logstash 7.2
- fix example indentation in tooltip documentation
- remove "createSnippet" method duplicates


## 0.0.2

- add documentation display when hover on a section, plugin or option
- files matching `logstash-*.conf` are automatically associated to `Logstash` language
- fix generated snippets that have an option value containing some “s”


## 0.0.1

- provide completion on Logstash sections, plugins and options
