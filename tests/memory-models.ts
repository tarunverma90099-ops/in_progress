/**
 * Minimal in-memory stand-in for the Mongoose models used by the API routes.
 *
 * The sandbox running these tests cannot reach the MongoDB binary hosts, so the
 * route handlers are exercised against this store instead of a real database.
 * It implements only the subset of the Mongoose API the routes actually use.
 */

let counter = 0;
const newId = () => (++counter).toString(16).padStart(24, '0');

type Doc = Record<string, unknown> & { _id: string };
type HydratedDoc = Doc & { toObject(): Doc; save(): Promise<Doc> };

const asString = (v: unknown) => (v === null || v === undefined ? '' : String(v));

function matches(doc: Doc, query: Record<string, unknown>): boolean {
  return Object.entries(query).every(([key, condition]) => {
    if (key === '$or') {
      return (condition as Record<string, unknown>[]).some((c) => matches(doc, c));
    }
    const value = doc[key];
    if (condition && typeof condition === 'object' && !Array.isArray(condition)) {
      const ops = condition as Record<string, unknown>;
      if ('$in' in ops) return (ops.$in as unknown[]).map(asString).includes(asString(value));
      if ('$ne' in ops) return asString(value) !== asString(ops.$ne);
      if ('$type' in ops) return value !== null && value !== undefined;
      if ('$regex' in ops) {
        return new RegExp(String(ops.$regex), String(ops.$options ?? '')).test(asString(value));
      }
    }
    return asString(value) === asString(condition);
  });
}

function applyUpdate(doc: Doc, update: Record<string, unknown>) {
  for (const [op, payload] of Object.entries(update)) {
    const fields = payload as Record<string, unknown>;
    if (op === '$set') {
      for (const [k, v] of Object.entries(fields)) {
        if (!k.includes('.')) doc[k] = v;
      }
    } else if (op === '$inc') {
      for (const [k, v] of Object.entries(fields)) {
        doc[k] = (Number(doc[k]) || 0) + Number(v);
      }
    } else if (op === '$push') {
      for (const [k, v] of Object.entries(fields)) {
        const list = (doc[k] as unknown[]) ?? [];
        list.push(v);
        doc[k] = list;
      }
    } else if (!op.startsWith('$')) {
      doc[op] = payload;
    }
  }
}

class Query<T> implements PromiseLike<T> {
  constructor(private readonly run: () => T) {}
  sort() {
    return this;
  }
  select() {
    return this;
  }
  limit() {
    return this;
  }
  lean() {
    return this;
  }
  then<R1 = T, R2 = never>(
    onfulfilled?: ((value: T) => R1 | PromiseLike<R1>) | null,
    onrejected?: ((reason: unknown) => R2 | PromiseLike<R2>) | null
  ): PromiseLike<R1 | R2> {
    return Promise.resolve(this.run()).then(onfulfilled, onrejected);
  }
}

export class Model {
  docs: Doc[] = [];
  constructor(public readonly defaults: Record<string, unknown> = {}) {}

  reset() {
    this.docs = [];
  }

  find(query: Record<string, unknown> = {}) {
    return new Query(() => this.docs.filter((d) => matches(d, query)).map(this.hydrate));
  }

  findOne(query: Record<string, unknown> = {}) {
    return new Query(() => {
      const found = this.docs.find((d) => matches(d, query));
      return found ? this.hydrate(found) : null;
    });
  }

  findById(id: unknown) {
    return this.findOne({ _id: id });
  }

  countDocuments(query: Record<string, unknown> = {}) {
    return new Query(() => this.docs.filter((d) => matches(d, query)).length);
  }

  exists(query: Record<string, unknown>) {
    return new Query(() => this.docs.find((d) => matches(d, query)) ?? null);
  }

  async create(input: Record<string, unknown>): Promise<HydratedDoc>;
  async create(input: Record<string, unknown>[]): Promise<HydratedDoc[]>;
  async create(
    input: Record<string, unknown> | Record<string, unknown>[]
  ): Promise<HydratedDoc | HydratedDoc[]> {
    if (Array.isArray(input)) {
      return Promise.all(input.map((i) => this.create(i)));
    }
    const doc: Doc = { _id: newId(), ...this.defaults, ...input };
    this.docs.push(doc);
    return this.hydrate(doc);
  }

  async insertMany(items: Record<string, unknown>[]) {
    return Promise.all(items.map((i) => this.create(i)));
  }

  async updateOne(query: Record<string, unknown>, update: Record<string, unknown>) {
    const doc = this.docs.find((d) => matches(d, query));
    if (doc) applyUpdate(doc, update);
    return { matchedCount: doc ? 1 : 0 };
  }

  async updateMany(query: Record<string, unknown>, update: Record<string, unknown>) {
    const docs = this.docs.filter((d) => matches(d, query));
    docs.forEach((d) => applyUpdate(d, update));
    return { matchedCount: docs.length };
  }

  async findOneAndUpdate(
    query: Record<string, unknown>,
    update: Record<string, unknown>,
    options: { upsert?: boolean } = {}
  ) {
    let doc = this.docs.find((d) => matches(d, query));
    if (!doc) {
      if (!options.upsert) return null;
      doc = { _id: newId(), ...this.defaults, ...query } as Doc;
      this.docs.push(doc);
    }
    applyUpdate(doc, update);
    return this.hydrate(doc);
  }

  async findByIdAndUpdate(id: unknown, update: Record<string, unknown>) {
    return this.findOneAndUpdate({ _id: id }, update);
  }

  async findOneAndDelete(query: Record<string, unknown>) {
    const index = this.docs.findIndex((d) => matches(d, query));
    if (index === -1) return null;
    return this.hydrate(this.docs.splice(index, 1)[0]);
  }

  async findByIdAndDelete(id: unknown) {
    return this.findOneAndDelete({ _id: id });
  }

  async deleteMany(query: Record<string, unknown> = {}) {
    const before = this.docs.length;
    this.docs = this.docs.filter((d) => !matches(d, query));
    return { deletedCount: before - this.docs.length };
  }

  private hydrate = (doc: Doc): HydratedDoc => {
    const self = this;
    return new Proxy(doc, {
      get(target, prop) {
        if (prop === 'toObject') return () => ({ ...target });
        if (prop === 'save') {
          return async () => {
            const index = self.docs.findIndex((d) => d._id === target._id);
            if (index >= 0) self.docs[index] = target;
            return target;
          };
        }
        return Reflect.get(target, prop);
      },
    }) as HydratedDoc;
  };
}

export const User = new Model({ role: 'student' });
export const Faculty = new Model({ status: 'active', subjects: [] });
export const Class = new Model({
  totalStudents: 0,
  capacity: 60,
  enrollmentOpen: true,
  sessionHistory: [],
});
export const Student = new Model({ attended: 0, total: 0, userId: null });
export const LeaveRequest = new Model({ status: 'Pending' });
export const AttendanceRecord = new Model({});
export const Session = new Model({ isActive: true, scannedStudents: [] });
export const StudentAttendance = new Model({ attended: 0, total: 0, history: [] });

export const ALL_MODELS = [
  User,
  Faculty,
  Class,
  Student,
  LeaveRequest,
  AttendanceRecord,
  Session,
  StudentAttendance,
];

export const resetAll = () => ALL_MODELS.forEach((m) => m.reset());
export const makeId = () => newId();
