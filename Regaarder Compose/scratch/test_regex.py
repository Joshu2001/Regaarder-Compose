import re
text = '''
<textarea
  placeholder="Add speaker notes..."
  className="w-full resize-none outline-none text-sm text-gray-600 bg-transparent min-h-[60px]"
  rows={3}
/>
'''
tags = re.findall(r'<(/?[a-zA-Z0-9_.]+)([^>]*)>', text)
for tag, attrs in tags:
    print(repr(tag), repr(attrs))
    print(attrs.strip().endswith('/'))
