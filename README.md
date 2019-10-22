# Logstash Configuration Editor

Provides completion for Logstash configuration files.

[Project Page](https://github.com/fbaligand/vscode-logstash-editor)

## Features

- Provides completion for Logstash configuration files (sections, plugins, options), depending current cursor position.  
For example, if cursor is inside `grok` filter, options for `grok` filter are suggested.
- All completion data is generated from official Logstash documentation (Logstash 7.2 at this time)
- Options for a plugin are sorted : first required options, then optional specific options, and finally optional common options
- When you preselect an item, a link to official documentation, a short description and an example (if available) are provided
- If you choose a completion item, a code snippet is automatically inserted with relevant content.
- Provides documentation when hover on a section, plugin or option

![Example](images/example.png)

Automatically detects files that match:

* `*logstash.conf`
* `*logstash.conf.j2`
* `*logstash.conf.template`
* `logstash-*.conf`


## Important note

For now, only this format style is supported:
``` ruby
filter {
	tcp {
		port => 12345
	}
}
```

This format style is not supported:
``` ruby
filter 
{
	tcp 
	{
		port => 12345
	}
}
```

Neither this one:
``` ruby
filter { tcp { port => 12345 } }
```
