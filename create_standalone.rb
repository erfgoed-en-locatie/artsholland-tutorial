#!/usr/local/bin/ruby 

require 'fileutils'
require 'faraday'

STANDALONE = "standalone"
HOST = "http://localhost:12345/"

files = [
  'prefixes.json',
  'tree.json',
  'index.html'
]

FileUtils.rm_r "./#{STANDALONE}" if File.exists?(STANDALONE)
Dir.mkdir(STANDALONE) unless File.exists?(STANDALONE)
FileUtils.cp_r './static', "./#{STANDALONE}"

def download(file)
  response = Faraday.get "#{HOST}#{file}"
  File.open("./#{STANDALONE}/#{file}", 'w') { |file| file.write(response.body) }  
end

pid = spawn './server.js'
Process.detach(pid)
sleep(3)
files.each { |file| download file }
sleep(3) 
Process.kill 'HUP', pid
