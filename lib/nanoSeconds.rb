f = File.new(File.expand_path(ARGV.at(0)))
puts Array[f.ctime.nsec, f.mtime.nsec]
