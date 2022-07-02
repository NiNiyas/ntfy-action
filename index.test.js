test('Map headers input to object', () => {
    let input = '{"x-api-key": "123456"}'
    input = JSON.parse(input)
    const headers = { 'Content-Type': 'multipart/form-data', ...input }
    expect(headers["Content-Type"]).toBe('multipart/form-data')
    expect(headers["x-api-key"]).toBe('123456')
    expect(headers).toEqual({ 'Content-Type': 'multipart/form-data', 'x-api-key': '123456' });
});

test('Map Data input to object', () => {
    let input = '{"key_1": "value_1", "key_2": "value_2"}'
    input = JSON.parse(input)
    const data = {}
    for (const [key, value] of Object.entries(input)) {
        data[key] = value
    }

    expect(data['key_1']).toBe('value_1')
    expect(data['key_2']).toBe('value_2')
    expect(data).toEqual({ 'key_1': 'value_1', 'key_2': 'value_2' });
});
