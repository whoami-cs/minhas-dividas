# Development Guidelines

## Code Quality Standards

### Angular Component Structure
- **Standalone Components**: All components use `standalone: true` with explicit imports
- **Change Detection**: Use `ChangeDetectionStrategy.OnPush` for performance optimization
- **Signal-Based State**: Prefer Angular signals over traditional observables for reactive state
- **Computed Values**: Use `computed()` for derived state that depends on other signals
- **Effects**: Use `effect()` for side effects that respond to signal changes

### Component Patterns
```typescript
@Component({
  selector: 'app-component-name',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ...],
  template: `...`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComponentNameComponent {
  // Input/Output using new signal-based API
  inputProp = input.required<Type>();
  outputEvent = output<Type>();
  
  // State management with signals
  localState = signal<Type>(initialValue);
  derivedState = computed(() => /* computation */);
  
  // Service injection
  private service = inject(ServiceName);
  
  // Lifecycle and effects
  constructor() {
    effect(() => {
      // React to signal changes
    }, { allowSignalWrites: true });
  }
}
```

### Form Management
- **Reactive Forms**: Use FormBuilder with typed form groups
- **Validation**: Apply validators at form control level
- **Disabled Fields**: Use `{ value: x, disabled: true }` for read-only calculated fields
- **Date Handling**: Convert between input format (YYYY-MM-DD) and display format (DD/MM/YYYY)
- **Form Patching**: Use `patchValue()` with `{ emitEvent: false }` to prevent circular updates

### Service Architecture
- **Injectable Root**: All services use `providedIn: 'root'`
- **Signal-Based State**: Services expose state via signals, not observables
- **Error Handling**: Centralized error handling with signal-based error state
- **API Communication**: Async/await pattern for HTTP requests
- **Token Management**: Centralized authentication token handling via TokenService

### API Integration Patterns
```typescript
async fetchData() {
  try {
    const response = await this.tokenService.fetchWithAuth(`${this.apiUrl}/endpoint`);
    if (!response.ok) {
      throw new Error(`Error message: ${response.status}`);
    }
    const data = await response.json();
    this.dataSignal.set(data || []);
    this.apiError.set(null);
  } catch (error: any) {
    console.error('Error context:', error);
    this.apiError.set(error.message || 'Fallback message');
    throw error;
  }
}
```

### Backend API Patterns
- **Controller Functions**: Export async functions for route handlers
- **Error Handling**: Try-catch with detailed console logging and user-friendly messages
- **Response Format**: Consistent JSON responses with error objects
- **Environment Variables**: Validate required env vars at module load time
- **Database Pooling**: Use connection pools with error event handlers

### Supabase Integration
- **Client Initialization**: Single Supabase client instance per service
- **Query Pattern**: Use `.select()`, `.insert()`, `.update()`, `.delete()` with `.single()` for single records
- **Error Checking**: Always check for `error` in response and throw if present
- **File Upload**: Use FormData for multipart uploads to storage buckets
- **RLS Policies**: Rely on Row Level Security for data access control

## Naming Conventions

### Files and Directories
- **Components**: `component-name.component.ts` (kebab-case)
- **Services**: `service-name.service.ts` (kebab-case)
- **Models**: `model-name.model.ts` (kebab-case)
- **Controllers**: `controllerName.js` (camelCase for backend)
- **Config Files**: `configName.js` (camelCase for backend)

### Code Identifiers
- **Variables/Functions**: camelCase (`currentValue`, `calculateTotal()`)
- **Classes/Interfaces**: PascalCase (`CreditCardDebt`, `DataService`)
- **Constants**: UPPER_SNAKE_CASE (`API_KEYS`, `MAX_RETRIES`)
- **Signals**: camelCase with descriptive names (`isLoading`, `selectedDebt`)
- **Private Members**: Prefix with underscore optional, prefer `private` keyword

### Database Conventions
- **Tables**: snake_case (`credit_card_debts`, `loan_attachments`)
- **Columns**: snake_case (`original_value`, `created_at`)
- **Foreign Keys**: `{table}_id` pattern (`debt_id`, `loan_id`)
- **Timestamps**: `created_at`, `updated_at` with timezone

## TypeScript Standards

### Type Definitions
- **Interfaces**: Define all data models in dedicated model files
- **Nullable Types**: Use `Type | null` for optional values
- **Type Safety**: Avoid `any` except in error handling (`error: any`)
- **Optional Properties**: Use `?` for optional interface properties
- **Array Types**: Use `Type[]` syntax over `Array<Type>`

### Type Annotations
```typescript
// Explicit return types for public methods
async fetchData(): Promise<DataType[]> { }

// Type parameters for generics
signal<Type>(initialValue)

// Union types for enums
status: 'active' | 'completed' | 'paused'
```

## Template Patterns

### Control Flow Syntax
- **Conditionals**: Use `@if` / `@else` blocks (new Angular syntax)
- **Loops**: Use `@for` with `track` expression
- **Empty States**: Provide `@else` blocks for empty data

```typescript
@if (condition) {
  <div>Content</div>
} @else {
  <div>Alternative</div>
}

@for (item of items(); track item.id) {
  <div>{{ item.name }}</div>
}
```

### Event Binding
- **Click Handlers**: `(click)="methodName()"`
- **Form Events**: `(change)="handler($event)"`, `(submit)="onSubmit()"`
- **Prevent Default**: Use `$event.stopPropagation()` in template

### Class Binding
- **Dynamic Classes**: Use `[ngClass]` with object syntax
- **Conditional Classes**: Ternary operators for simple conditions
- **TailwindCSS**: Utility-first approach with responsive modifiers

## State Management Patterns

### Signal Usage
```typescript
// Simple state
const count = signal(0);

// Computed state
const doubled = computed(() => count() * 2);

// Update patterns
count.set(5);                    // Replace value
count.update(n => n + 1);        // Transform value

// Array updates
items.update(arr => [...arr, newItem]);
items.update(arr => arr.filter(i => i.id !== id));
items.update(arr => arr.map(i => i.id === id ? updated : i));
```

### Effect Patterns
```typescript
effect(() => {
  const value = someSignal();
  // React to changes
}, { allowSignalWrites: true });  // When writing to signals inside effect
```

### Component Communication
- **Parent to Child**: Use `input()` for data passing
- **Child to Parent**: Use `output()` for event emission
- **Service State**: Share state via service signals
- **ViewChild**: Use `viewChild<Type>('reference')` for template references

## Error Handling

### Frontend Error Handling
```typescript
try {
  await operation();
  this.showMessage({ type: 'success', text: 'Success message' });
} catch (error: any) {
  console.error('Context:', error);
  this.showMessage({ type: 'error', text: error.message || 'Fallback' });
  throw error;  // Re-throw if caller needs to handle
}
```

### Backend Error Handling
```javascript
try {
  // Operation
  res.json(data);
} catch (error) {
  console.error('Error context:', error);
  console.error('Error stack:', error.stack);
  res.status(500).json({ error: 'User-friendly message' });
}
```

### User Feedback
- **Loading States**: Use `isLoading` signal with loading modals/spinners
- **Success Messages**: Toast notifications with auto-dismiss (5 seconds)
- **Error Messages**: Persistent error display with manual dismiss
- **Confirmation Dialogs**: Modal components for destructive actions

## API Design Patterns

### RESTful Endpoints
```
GET    /resource          - List all
GET    /resource/:id      - Get single
POST   /resource          - Create
PUT    /resource/:id      - Update
DELETE /resource/:id      - Delete
```

### Request/Response Format
```typescript
// Request body
{ ...data, user_id: userId }

// Success response
{ id, ...data }

// Error response
{ error: 'Message' }
```

### Authentication
- **Token Header**: `Authorization: Bearer <token>`
- **Token Refresh**: Automatic refresh on 401 responses
- **Protected Routes**: Use `fetchWithAuth()` wrapper for authenticated requests

## File Upload Patterns

### Frontend Upload
```typescript
async handleUpload(event: any) {
  const files = Array.from(event.target.files) as File[];
  for (const file of files) {
    await this.dataService.uploadFile(file, entityId, description);
  }
  event.target.value = '';  // Reset input
}
```

### Backend Upload
```javascript
// Multer configuration
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }  // 10MB
});

// Route handler
router.post('/upload/:id', upload.single('file'), async (req, res) => {
  const file = req.file;
  const { description } = req.body;
  // Process upload
});
```

## Database Query Patterns

### Supabase Queries
```typescript
// Select with filter
const { data, error } = await supabase
  .from('table')
  .select('*')
  .eq('column', value)
  .single();

// Insert
const { data, error } = await supabase
  .from('table')
  .insert({ ...data })
  .select()
  .single();

// Update
const { data, error } = await supabase
  .from('table')
  .update({ ...data })
  .eq('id', id)
  .select()
  .single();

// Delete
const { error } = await supabase
  .from('table')
  .delete()
  .eq('id', id);
```

### PostgreSQL Direct Queries
```javascript
const result = await pool.query(
  'SELECT * FROM table WHERE column = $1',
  [value]
);
```

## AI Integration Patterns

### Streaming Responses
```javascript
// Backend: Server-Sent Events
res.setHeader('Content-Type', 'text/event-stream');
res.setHeader('Cache-Control', 'no-cache');
res.setHeader('Connection', 'keep-alive');

for await (const chunk of stream) {
  res.write(`data: ${JSON.stringify({ chunk: text })}\n\n`);
}
res.write('data: [DONE]\n\n');
res.end();
```

### Context Building
- **Scoped Context**: Provide only relevant data for specific views
- **System Prompts**: Clear instructions with data boundaries
- **History Management**: Store conversation history in database
- **Structured Output**: Use JSON schema for consistent AI responses

## Performance Optimization

### Component Optimization
- **OnPush Strategy**: Reduces change detection cycles
- **Track Functions**: Optimize `@for` loops with unique identifiers
- **Lazy Loading**: Load components/modules on demand
- **Computed Signals**: Cache derived values automatically

### API Optimization
- **Connection Pooling**: Reuse database connections
- **Batch Operations**: Group related database operations
- **Pagination**: Limit query results with `.limit()`
- **Selective Fields**: Use `.select('field1, field2')` instead of `*`

## Security Best Practices

### Frontend Security
- **Input Sanitization**: Validate all user inputs
- **XSS Prevention**: Use Angular's built-in sanitization
- **Token Storage**: Store tokens securely (not in localStorage)
- **CORS**: Configure allowed origins

### Backend Security
- **Environment Variables**: Never commit secrets to version control
- **SQL Injection**: Use parameterized queries
- **Rate Limiting**: Implement API rate limits
- **Input Validation**: Validate all request data
- **Error Messages**: Don't expose sensitive information in errors

### Database Security
- **Row Level Security**: Enable RLS on all tables
- **Policies**: Define granular access policies
- **SSL Connections**: Require SSL for database connections
- **Least Privilege**: Grant minimal necessary permissions

## Testing Considerations

### Component Testing
- Test signal state changes
- Verify computed values
- Mock injected services
- Test event emissions

### Service Testing
- Mock HTTP responses
- Test error handling
- Verify state updates
- Test async operations

### Integration Testing
- Test API endpoints
- Verify database operations
- Test authentication flow
- Validate file uploads

## Documentation Standards

### Code Comments
- **Minimal Comments**: Write self-documenting code
- **Complex Logic**: Comment non-obvious algorithms
- **TODOs**: Mark incomplete features with `// TODO:`
- **API Documentation**: Document public service methods

### README Files
- **Setup Instructions**: Clear environment setup steps
- **Configuration**: Document required environment variables
- **API Documentation**: List available endpoints
- **Migration Instructions**: Database setup procedures

## Common Patterns Summary

### Frequently Used Idioms
1. **Signal Updates**: `signal.update(val => transformedVal)`
2. **Array Filtering**: `array.filter(item => condition)`
3. **Array Mapping**: `array.map(item => transformed)`
4. **Null Coalescing**: `value ?? defaultValue`
5. **Optional Chaining**: `object?.property?.nested`
6. **Async/Await**: Preferred over `.then()` chains
7. **Destructuring**: `const { data, error } = await operation()`
8. **Spread Operator**: `{ ...existing, ...updates }`

### Design Patterns
1. **Service Layer**: Centralized data access and business logic
2. **Component Composition**: Small, focused components
3. **Reactive State**: Signal-based reactive programming
4. **Dependency Injection**: Constructor injection via `inject()`
5. **Repository Pattern**: DataService as data access layer
6. **Observer Pattern**: Effects reacting to signal changes
7. **Factory Pattern**: FormBuilder for form creation
8. **Singleton Pattern**: Root-level services

## Portuguese Language Standards

### User-Facing Text
- All UI text, messages, and labels in Brazilian Portuguese
- Error messages in Portuguese with technical details in logs
- Date format: DD/MM/YYYY
- Currency format: R$ with Brazilian locale
- Decimal separator: comma (,)
- Thousands separator: period (.)

### Code vs. UI Language
- **Code**: English (variables, functions, classes)
- **UI**: Portuguese (labels, messages, placeholders)
- **Comments**: English preferred, Portuguese acceptable
- **Documentation**: Portuguese for user docs, English for technical docs
