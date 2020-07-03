import re
import os

FILE_SUBDIR = 'draft/templates/files/'

# if line starts with one of these characters, ignore the line
IGNORE_CHARS = '#*'
def ignore_line(l):
    for c in IGNORE_CHARS:
        if l.startswith(c):
            return True
    return False


def create_draft_file(text):
    lines = text.split('\n')
    title = lines[0][2:]
    filename = re.sub(r'\W+', '', title.lower().replace(' ', '_')) + '.html'

    if os.path.isfile(os.path.join(FILE_SUBDIR, filename)):
        return None, None

    with open(os.path.join(FILE_SUBDIR, filename), 'w+') as f:
        p_count = 0
        paragraph = []

        def write_p():
            f.write('<p id="p{}">{}</p>\n'.format(p_count, paragraph))

        f.write('{% extends "file.html" %}\n')
        f.write('{% block content %}\n')
        for l in lines[1:]:
            l = l.strip()
            if (len(paragraph) == 0 and not l) or ignore_line(l):
                continue

            if not l:
                # finish paragraph
                paragraph = '<br>'.join(paragraph)
                write_p()
                p_count += 1
                paragraph = []
            else:
                paragraph.append(l)

        write_p()
        f.write('{% endblock %}\0')

    return filename, title


def delete_draft_file(draft):
    os.remove(os.path.join(FILE_SUBDIR, draft.filename))
