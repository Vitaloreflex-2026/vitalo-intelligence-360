import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { useTaskExit } from "./useTaskExit";

const Probe = ({ onRemove }: { onRemove: () => void }) => {
  const { isLeaving, leave } = useTaskExit();

  return (
    <button onClick={() => leave(onRemove)}>
      {isLeaving ? "leaving" : "idle"}
    </button>
  );
};

describe("useTaskExit", () => {
  it("plays the exit animation before removing the task", async () => {
    // Arrange
    const remove = vi.fn();
    const screen = await render(<Probe onRemove={remove} />);

    // Act
    await screen.getByRole("button").click();

    // Assert
    await expect.element(screen.getByText("leaving")).toBeInTheDocument();
    expect(remove).not.toHaveBeenCalled();
    await expect.poll(() => remove.mock.calls.length).toBe(1);
  });
});
