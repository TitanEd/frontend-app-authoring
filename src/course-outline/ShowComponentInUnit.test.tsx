import { blockTypeOf, unitPageOf } from './ShowComponentInUnit';

const COURSE = 'course-v1:TitanEd+CS101+2026';
const block = (type: string, id: string) => `block-v1:TitanEd+CS101+2026+type@${type}+block@${id}`;

describe('ShowComponentInUnit helpers', () => {
  it('reads the block type of a usage key', () => {
    expect(blockTypeOf(block('problem', 'p1'))).toBe('problem');
    expect(blockTypeOf(block('vertical', 'u1'))).toBe('vertical');
    expect(blockTypeOf('not a key')).toBeUndefined();
  });

  it('opens the unit of a component and shows the component', () => {
    const problem = block('problem', 'p1');
    const ancestors = [
      { id: block('vertical', 'u1'), category: 'vertical' },
      { id: block('sequential', 's1'), category: 'sequential' },
    ];
    expect(unitPageOf(COURSE, problem, ancestors)).toBe(
      `/course/${COURSE}/container/${block('vertical', 'u1')}?show=${encodeURIComponent(problem)}`,
    );
  });

  it('shows the library content block of a component inside one', () => {
    const libraryContent = block('library_content', 'l1');
    const ancestors = [
      { id: libraryContent, category: 'library_content' },
      { id: block('vertical', 'u1'), category: 'vertical' },
    ];
    expect(unitPageOf(COURSE, block('problem', 'p1'), ancestors)).toBe(
      `/course/${COURSE}/container/${block('vertical', 'u1')}?show=${encodeURIComponent(libraryContent)}`,
    );
  });

  it('gives nothing when no unit holds the block', () => {
    expect(unitPageOf(COURSE, block('problem', 'p1'), [{ id: block('chapter', 'c1'), category: 'chapter' }])).toBeNull();
  });
});
