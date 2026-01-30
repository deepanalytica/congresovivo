import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-95",
    {
        variants: {
            variant: {
                default:
                    "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90",
                destructive:
                    "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/20 hover:bg-destructive/90",
                outline:
                    "border border-white/10 bg-white/5 hover:bg-white/10 hover:text-accent-foreground backdrop-blur-sm",
                secondary:
                    "bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700",
                ghost: "hover:bg-white/10 hover:text-accent-foreground",
                link: "text-primary underline-offset-4 hover:underline",
                premium: "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl shadow-blue-500/20 hover:from-blue-700 hover:to-purple-700 border-none",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3",
                lg: "h-11 rounded-md px-8",
                xl: "h-14 rounded-xl px-10 text-base",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
