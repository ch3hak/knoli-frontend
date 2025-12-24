import * as React from "react";
import { cn } from "../../lib/utils";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  htmlFor?: string;
  children?: React.ReactNode;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, htmlFor, ...props }, ref) => {
    return (
      <label
        ref={ref}
        htmlFor={htmlFor}
        {...props}
        className={cn(
          "inline-block text-sm font-pixel tracking-wider text-muted-foreground",
          "select-none",
          className
        )}
      >
        {children}
      </label>
    );
  }
);

Label.displayName = "Label";

export default Label;
