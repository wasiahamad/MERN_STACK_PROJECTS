export function ok(res, data, message = "OK") {
  return res.json({ data, message });
}

export function created(res, data, message = "Created") {
  return res.status(201).json({ data, message });
}
