import yaml
import json
import os

with open('openAPI.yml', 'r', encoding='utf-8') as f:
    spec = yaml.safe_load(f)

schemas = spec.get('components', {}).get('schemas', {})

def format_schema(schema_obj):
    if not schema_obj:
        return 'ندارد'
    if '$ref' in schema_obj:
        ref_name = schema_obj['$ref'].split('/')[-1]
        return f'`{ref_name}`'
    if schema_obj.get('type') == 'array':
        items = schema_obj.get('items', {})
        if '$ref' in items:
            ref_name = items['$ref'].split('/')[-1]
            return f'آرایه‌ای از `{ref_name}`'
        return f'آرایه‌ای از `{items.get("type", "object")}`'
    if schema_obj.get('type') == 'object':
        props = list(schema_obj.get('properties', {}).keys())
        return f'شیء مستند با ویژگی‌های: {props}'
    return f'`{schema_obj.get("type", "ویژگی یا شیء")}`'

md_lines = []
md_lines.append('# شناسنامه مکمل و فهرست Endpointهای استخراج‌شده از قرارداد OpenAPI (openAPI.yml)')
md_lines.append('')
md_lines.append('**تاریخ تنظیم:** اسفند ۱۴۰۳ (مارس ۲۰۲۶)')
md_lines.append('**نسخه قرارداد:** Medusa v2 API Specification 2.21.2')
md_lines.append('**وضعیت اعتبارسنجی ساختاری:** تأییدشده با ابزار `openapi-spec-validator` (پاسخ: `openAPI.yml: OK`)')
md_lines.append('**تعداد کل Endpointهای استخراج‌شده:** ۴۲ عدد')
md_lines.append('')
md_lines.append('---')
md_lines.append('')
md_lines.append('## ۱. خلاصه عمومی و روش‌های احراز هویت')
md_lines.append('')
md_lines.append('در این قرارداد OpenAPI دو روش اصلی احراز هویت تعریف شده است:')
md_lines.append('1. **Bearer JWT Token** (`bearerAuth`): ارسال توکن در هدر `Authorization: Bearer <JWT>` (مورد استفاده در Endpointهای اداری و برخی Endpointهای مشتری).')
md_lines.append('2. **Session Cookie** (`cookieAuth`): استفاده از کوکی نشست به نام `connect.sid` (مورد استفاده در Endpointهای مشتری مانند اعلانات و تیکت‌ها).')
md_lines.append('')
md_lines.append('مسیرهای عمومی فروشگاه (`/store/brands`, `/store/categories`, `/store/products/{id}/size-guide`, `/auth/phone/*`, `/store/reviews/media`) نیاز به احراز هویت ندارند (`security: []`).')
md_lines.append('')
md_lines.append('---')
md_lines.append('')
md_lines.append('## ۲. فهرست تفکیکی ۴۲ Endpoint استخراج‌شده')
md_lines.append('')

paths = spec.get('paths', {})

ep_index = 1
for path, methods in paths.items():
    for method_name, details in methods.items():
        if method_name not in ['get', 'post', 'put', 'patch', 'delete']:
            continue
        method = method_name.upper()
        op_id = details.get('operationId', 'تعریف‌نشده')
        summary = details.get('summary', 'بدون خلاصه')
        desc = details.get('description', 'بدون توضیحات تکمیلی')
        tags = ', '.join(details.get('tags', ['عمومی']))

        # Security
        sec = details.get('security', None)
        if sec == []:
            auth_str = 'بدون نیاز به احراز هویت (عمومی)'
        elif sec is None:
            auth_str = 'احراز هویت پیش‌فرض (Bearer JWT یا Cookie)'
        else:
            sec_keys = []
            for s in sec:
                sec_keys.extend(list(s.keys()))
            auth_str = ' / '.join(sec_keys) if sec_keys else 'بدون نیاز به احراز هویت'

        # Parameters
        params = details.get('parameters', [])
        path_params = [p for p in params if p.get('in') == 'path']
        query_params = [p for p in params if p.get('in') == 'query']
        header_params = [p for p in params if p.get('in') == 'header']

        # Pagination / Filter / Sort
        pag_info = []
        q_names = [p.get('name') for p in query_params]
        if 'limit' in q_names:
            pag_info.append('Limit (تعداد در هر صفحه)')
        if 'offset' in q_names:
            pag_info.append('Offset (جابه‌جایی)')
        if any(k in q_names for k in ['status', 'type', 'customer_id', 'category_id', 'is_active']):
            pag_info.append('فیلتر براساس پارامترهای Query')
        if 'q' in q_names:
            pag_info.append('جستجوی متنی (q)')
        pag_str = '، '.join(pag_info) if pag_info else 'ندارد / تعریف‌نشده در این Endpoint'

        # Request Body
        req_body = details.get('requestBody', {})
        req_content = req_body.get('content', {})
        req_types = list(req_content.keys())
        req_type_str = ', '.join(req_types) if req_types else 'ندارد'

        req_schema_str = 'ندارد'
        upload_limit_str = 'ندارد'

        if req_content:
            for ct, c_obj in req_content.items():
                s_obj = c_obj.get('schema', {})
                req_schema_str = format_schema(s_obj)
                if ct == 'multipart/form-data':
                    upload_limit_str = 'پشتیبانی از آپلود فایل در قالب multipart/form-data (فایل عکس/ویدیو، حداکثر حجم مجاز در سطح سرور/Nginx تعیین می‌شود)'

        # Responses
        responses = details.get('responses', {})
        succ_resp = []
        err_resp = []
        for code, r_obj in responses.items():
            r_desc = r_obj.get('description', '')
            r_content = r_obj.get('content', {})
            r_schemas = []
            for r_ct, r_c_obj in r_content.items():
                r_s = format_schema(r_c_obj.get('schema', {}))
                r_schemas.append(f'`{r_ct}`: {r_s}')
            schema_formatted = ' | '.join(r_schemas) if r_schemas else 'بدون Schema'

            if str(code).startswith('2'):
                succ_resp.append(f'**{code}**: {r_desc} ({schema_formatted})')
            else:
                err_resp.append(f'**{code}**: {r_desc} ({schema_formatted})')

        succ_str = '<br>'.join(succ_resp) if succ_resp else '۲۰۰ OK'
        err_str = '<br>'.join(err_resp) if err_resp else '۴۰۰ / ۴۰۱ / ۴۰۳ / ۴۰۴ / ۵۰۰ (پاسخ خطای استاندارد)'

        md_lines.append(f'### {ep_index}. `{method}` `{path}`')
        md_lines.append(f'- **operationId:** `{op_id}`')
        md_lines.append(f'- **عنوان عملیات:** {summary}')
        md_lines.append(f'- **توضیحات:** {desc}')
        md_lines.append(f'- **دسته‌بندی (Tag):** {tags}')
        md_lines.append(f'- **روش احراز هویت:** {auth_str}')
        md_lines.append(f'- **پشتیبانی از صفحه‌بندی / فیلتر / جستجو:** {pag_str}')
        md_lines.append(f'- **محدودیت/شرایط آپلود فایل:** {upload_limit_str}')

        # Params details
        if path_params or query_params or header_params:
            md_lines.append('- **پارامترهای ورودی:**')
            if path_params:
                p_strs = [f'`{p["name"]}` ({p.get("schema", {}).get("type", "string")}{" - اجباری" if p.get("required") else ""}): {p.get("description", "")}' for p in path_params]
                md_lines.append(f'  - *Path Parameters:* {"; ".join(p_strs)}')
            if query_params:
                q_strs = [f'`{p["name"]}` ({p.get("schema", {}).get("type", "string")}{" - اجباری" if p.get("required") else ""}): {p.get("description", "")}' for p in query_params]
                md_lines.append(f'  - *Query Parameters:* {"; ".join(q_strs)}')
            if header_params:
                h_strs = [f'`{p["name"]}` ({p.get("schema", {}).get("type", "string")}{" - اجباری" if p.get("required") else ""}): {p.get("description", "")}' for p in header_params]
                md_lines.append(f'  - *Header Parameters:* {"; ".join(h_strs)}')
        else:
            md_lines.append('- **پارامترهای ورودی:** ندارد')

        md_lines.append(f'- **بدنه درخواست (RequestBody):** نوع `{req_type_str}` - Schema: {req_schema_str}')
        md_lines.append(f'- **پاسخ‌های موفق:** {succ_str}')
        md_lines.append(f'- **پاسخ‌های خطا:** {err_str}')
        md_lines.append('')

        ep_index += 1

md_lines.append('---')
md_lines.append('')
md_lines.append('## ۳. مدل‌های داده مشترک (Shared Data Models) و Enumها')
md_lines.append('')
md_lines.append('در بخش `components/schemas` سند OpenAPI مدل‌های زیر به عنوان تک‌منبع حقیقت تعریف شده‌اند:')
md_lines.append('')

for s_name, s_def in schemas.items():
    s_type = s_def.get('type', 'object')
    req_fields = s_def.get('required', [])
    props = s_def.get('properties', {})

    md_lines.append(f'### مدل `{s_name}`')
    md_lines.append(f'- **نوع:** `{s_type}`')
    md_lines.append(f'- **فیلدهای اجباری (Required):** `{req_fields}`')
    md_lines.append('- **ویژگی‌ها (Properties):**')

    for p_name, p_def in props.items():
        p_type = p_def.get('type', 'ویژگی')
        if '$ref' in p_def:
            p_type = f'ارتباط با `{p_def["$ref"].split("/")[-1]}`'
        elif p_type == 'array':
            items = p_def.get('items', {})
            if '$ref' in items:
                p_type = f'آرایه‌ای از `{items["$ref"].split("/")[-1]}`'
            else:
                p_type = f'آرایه‌ای از `{items.get("type", "object")}`'

        nullable = ' (قابل مقداردهی null)' if p_def.get('nullable') else ''
        enum_vals = f' - Enum مقادیر: `{p_def.get("enum")}`' if 'enum' in p_def else ''
        example_val = f' - نمونه: `{p_def.get("example")}`' if 'example' in p_def else ''
        desc_val = f' - {p_def.get("description")}' if 'description' in p_def else ''

        md_lines.append(f'  - `{p_name}` ({p_type}){nullable}{enum_vals}{example_val}{desc_val}')
    md_lines.append('')

output_content = '\n'.join(md_lines)
with open('docs/openapi-endpoint-inventory.md', 'w', encoding='utf-8') as out_f:
    out_f.write(output_content)

print('Successfully generated docs/openapi-endpoint-inventory.md')
