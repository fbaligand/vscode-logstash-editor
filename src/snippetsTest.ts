import { createSnippet } from './snippetCreator';
import * as vscode from 'vscode';

export const snippetsBase: Record<string, vscode.CompletionItem[]> = {
	"logstash-root": [
		createSnippet(
			'input',
			'section',
			'input {\n\t$0\n}',
			'Input section'
		),

		createSnippet(
			'filter', 
			'section',
			'filter {\n\t$0\n}',
			'Filter section'
		),

		createSnippet(
			'output', 
			'section',
			'output {\n\t$0\n}',
			'Output section'
		)
	],


	"logstash-filter": [
		createSnippet(
			'aggregate',
			'plugin',
			'aggregate {\n\ttask_id => "${1:task_id}"\n\tcode => "${2:code}"\n}',
			'[aggregate filter](https://www.elastic.co/guide/en/logstash/current/plugins-filters-aggregate.html)'
		)
	],


	"logstash-filter-aggregate": [
		createSnippet(
			'task_id',
			'option',
			'task_id => "${0:task_id}"',
			'task_id option',
			true
		),
		createSnippet(
			'code',
			'option',
			'code => "${0:code}"',
			'code option',
			true
		),
		createSnippet(
			'end_of_task',
			'option',
			'end_of_task => ${0:true}',
			'end_of_task option'
		),
		createSnippet(
			'timeout',
			'option',
			'timeout => ${1:5}',
			'timeout option'
		)
	],

	"logstash-filter-common_options": [
		createSnippet(
			'add_tag',
			'common_option',
			'add_tag => ["${0:tag1}"]',
			'add_tag option'
		)
	],

	"logstash-codec": [
		createSnippet(
			'plain',
			'plugin',
			'plain {\n}',
			'plain codec'
		)
	]

};