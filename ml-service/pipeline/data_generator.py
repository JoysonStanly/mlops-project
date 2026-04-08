from __future__ import annotations

import argparse
import random
from pathlib import Path

import pandas as pd

HUMAN_TEMPLATES = [
    """def fibonacci(n):
    sequence = [0, 1]
    for i in range(2, n):
        sequence.append(sequence[i-1] + sequence[i-2])
    return sequence[:n]
""",
    """function sumScores(scores) {
  let total = 0;
  for (const score of scores) {
    total += score;
  }
  return total / scores.length;
}
""",
    """# parse user records from csv
import csv

def load_records(path):
    records = []
    with open(path, newline='', encoding='utf-8') as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            records.append(row)
    return records
""",
    """class DataProcessor:
    def __init__(self, data):
        self.data = data
        self.errors = []
    
    def validate(self):
        # Check for empty or None values
        for idx, item in enumerate(self.data):
            if not item:
                self.errors.append(f"Missing value at index {idx}")
        return len(self.errors) == 0
    
    def get_errors(self):
        return self.errors
""",
    """// React component for displaying user profile
export const UserProfile = ({ userId }) => {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    fetchUser(userId).then(u => {
      setUser(u);
      setLoading(false);
    }).catch(err => console.error(err));
  }, [userId]);
  
  if (loading) return <div>Loading...</div>;
  return <div className="profile">{user.name}</div>;
};
""",
    """def calculate_tax(income, rate):
    '''Calculate tax based on income and rate'''
    if income < 0:
        raise ValueError("Income cannot be negative")
    
    tax = income * rate
    return round(tax, 2)
""",
    """// Handle user authentication
async function authenticateUser(username, password) {
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        
        if (!response.ok) {
            throw new Error('Login failed');
        }
        
        const data = await response.json();
        return data.token;
    } catch (e) {
        console.error('Auth error:', e);
        return null;
    }
}
""",
]

AI_TEMPLATES = [
    """def process_data(data):
    output = []
    for item in data:
        if item is None:
            continue
        transformed = str(item).strip().lower()
        output.append(transformed)
    summary = {
        'count': len(output),
        'items': output,
    }
    return summary
""",
    """function optimizeWorkflow(entries) {
  const normalized = [];
  for (let index = 0; index < entries.length; index++) {
    const element = entries[index];
    if (element === undefined || element === null) {
      continue;
    }
    normalized.push(String(element).trim().toLowerCase());
  }
  return {
    status: 'completed',
    count: normalized.length,
    data: normalized,
  };
}
""",
    """# generated utility for task orchestration
def execute_pipeline(items):
    refined = []
    for value in items:
        if value is None:
            continue
        cleaned = str(value).strip()
        if not cleaned:
            continue
        refined.append(cleaned.lower())
    return {
        "state": "ok",
        "size": len(refined),
        "payload": refined,
    }
""",
    """def handle_request(request_data):
    result = []
    for item in request_data:
        if item:
            normalized_item = str(item).strip().lower()
            result.append(normalized_item)
    
    response_body = {
        'status': 'success',
        'count': len(result),
        'results': result
    }
    return response_body
""",
    """const processItems = (items) => {
  const processed = [];
  for (let i = 0; i < items.length; i++) {
    const current_item = items[i];
    if (current_item !== null && current_item !== undefined) {
      const normalized = String(current_item).trim().toLowerCase();
      processed.push(normalized);
    }
  }
  
  return {
    total_processed: processed.length,
    processed_items: processed,
    process_date: new Date().toISOString()
  };
};
""",
    """def apply_transformation(input_list):
    output_list = []
    iteration = 0
    
    while iteration < len(input_list):
        current_element = input_list[iteration]
        if current_element is not None:
            cleaned_value = str(current_element).strip().lower()
            output_list.append(cleaned_value)
        iteration = iteration + 1
    
    final_result = {
        "elements_processed": len(output_list),
        "elements": output_list
    }
    return final_result
""",
    """interface DataModule {
  process(input: any[]): ProcessedResult;
  validate(data: any): boolean;
}

const impl: DataModule = {
  process: function(input) {
    const result = [];
    for (let idx = 0; idx < input.length; idx++) {
      const el = input[idx];
      if (el !== null && el !== undefined) {
        result.push(String(el).trim().toLowerCase());
      }
    }
    return { count: result.length, items: result };
  },
  validate: function(data) {
    return Array.isArray(data);
  }
};
""",
]


def add_variation(text: str) -> str:
    suffix_pool = [
        "\n# todo: improve edge case handling",
        "\n# reviewer note: refactor later",
        "\n\n// fallback branch retained for compatibility",
        "\n\nif __name__ == '__main__':\n    pass",
    ]
    return text + random.choice(suffix_pool)


def build_dataset(samples_per_class: int, seed: int) -> pd.DataFrame:
    random.seed(seed)
    rows: list[dict[str, str | int]] = []

    for _ in range(samples_per_class):
        human = add_variation(random.choice(HUMAN_TEMPLATES))
        ai = add_variation(random.choice(AI_TEMPLATES))
        rows.append({'text': human, 'label': 0, 'source': 'human_template'})
        rows.append({'text': ai, 'label': 1, 'source': 'ai_template'})

    random.shuffle(rows)
    return pd.DataFrame(rows)


def main() -> None:
    parser = argparse.ArgumentParser(description='Generate synthetic dataset for AI vs human classification.')
    parser.add_argument('--samples-per-class', type=int, default=300)
    parser.add_argument('--seed', type=int, default=42)
    parser.add_argument('--out', type=str, default='data/dataset.csv')
    args = parser.parse_args()

    dataset = build_dataset(samples_per_class=args.samples_per_class, seed=args.seed)
    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    dataset.to_csv(out_path, index=False)
    print(f'Wrote dataset with {len(dataset)} rows to {out_path}')


if __name__ == '__main__':
    main()
