type JSONPrimitive = string | number | boolean | null;

type JSONArray = JSONValue[];

type JSONValue = JSONPrimitive | JSONObject | JSONArray;

type JSONObject = {
  [key: string]: JSONValue;
};

type EventRequired = {
  type: string;
  createdAt: number;
  toVersion: number;
} & JSONObject;

export type EventContract<T extends EventRequired> = T;
