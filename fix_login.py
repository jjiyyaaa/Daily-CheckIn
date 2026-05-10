import re

with open("login.html", "r", encoding="utf-8") as f:
    content = f.read()

# We need to wrap <span class="input-prefix">... <input ...> and optional <button class="pw-toggle">
# inside <div style="position: relative;">
def replacer(match):
    inner = match.group(1)
    # The inner content usually starts with <span class="input-prefix">
    # We want to wrap everything up to the <input> or <button>
    # Let's just find the <div class="field-feedback" or <div class="pw-strength"
    # and put everything before it into a wrapper.
    parts = re.split(r'(<div class="(?:pw-strength|field-feedback)")', inner, 1)
    if len(parts) > 1:
        wrapped = f'\n        <div style="position: relative;">{parts[0].rstrip()}\n        </div>\n        {parts[1]}{parts[2]}'
        return f'<div class="auth-input-group">{wrapped}</div>'
    return match.group(0)

new_content = re.sub(r'<div class="auth-input-group">(.*?)</div>\s*(?=</div|<div|<button)', replacer, content, flags=re.DOTALL)

with open("login.html", "w", encoding="utf-8") as f:
    f.write(new_content)
print("Done")
